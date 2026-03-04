import { Order } from './order.model';
import { User } from '../user/user.model';
import { QuickBooksService } from '../quickbook/quickbook.service';
import { CreditService } from '../credit/credit.service';
import { IOrder, OrderStatus, PaymentStatus } from './order.interface';
import mongoose from 'mongoose';
import { ProductModel } from '../product.catelog/product.model';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';



export class OrderService {
  private quickBooksService: QuickBooksService;
  private creditService: CreditService;

  constructor() {
    this.quickBooksService = new QuickBooksService();
    this.creditService = new CreditService();
  }

    // Helper to generate order number inside a transaction
  private async generateOrderNumber(session: mongoose.ClientSession): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const count = await Order.countDocuments({}, { session });
    const sequence = (count + 1).toString().padStart(4, '0');

    return `ORD-${year}${month}${day}-${sequence}`;
  }

  async createOrder(userId: string, orderData: any): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error('User not found');

      const canPlaceOrder = await this.creditService.checkCreditAvailability(
        userId,
        orderData.totalAmount
      );
      if (!canPlaceOrder) throw new Error('Insufficient credit limit');

      // Validate and update product stock
      for (const item of orderData.items) {
        const product = await ProductModel.findById(item.productId).session(session);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.productName}`);
        product.stock -= item.quantity;
        await product.save({ session });
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const orderNumber = await this.generateOrderNumber(session);

      const order = new Order({
        ...orderData,
        userId,
        dueDate,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        orderNumber,
      });
      await order.save({ session });

      const token = await this.quickBooksService.getValidToken();
        
      // Create QuickBooks customer if not exists
      if (!user.quickbooksId) {
        const qbCustomerId = await this.quickBooksService.createCustomer(user, token?.realmId || '', token?.accessToken || '');
        user.quickbooksId = qbCustomerId;
        await User.updateOne({ _id: user._id }, { $set: { quickbooksId: qbCustomerId } }).session(session);
      }

      // Create invoice in QuickBooks
      const invoice = await this.quickBooksService.createInvoice(order, user, token?.realmId || '', token?.accessToken || '');
      order.quickbooksInvoiceId = invoice.invoiceId;
      order.invoiceNumber = invoice.invoiceNumber;
      order.invoiceUrl = invoice.invoiceUrl;
      order.paymentLink = invoice.paymentLink;

      const value = {
        orderNumber: invoice.orderNumber,
        invoiceNumber: invoice.invoiceNumber,
        paymentLink: invoice.paymentLink,
        email: user.email,
      };
      const forgetPassword = emailTemplate.invoicePaymentLinkEmail(value);
      emailHelper.sendEmail(forgetPassword);


      await order.save({ session });

      await this.creditService.updateOutstandingBalance(
        userId,
        order.totalAmount,
        order._id.toString(),
        `Order placed - #${order.orderNumber}`,
        session
      );

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<IOrder | null> {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    return order;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<IOrder | null> {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );

    if (paymentStatus === PaymentStatus.PAID && order) {
      // Update credit balance when payment is received
      await this.creditService.updateOutstandingBalance(
        order.userId.toString(),
        -order.totalAmount,
        orderId,
        `Payment received - #${order.orderNumber}`
      );
    }

    return order;
  }

async getUserOrders(
  userId: string,
  query: any
): Promise<{ orders: IOrder[]; total: number }> {

  // ✅ Parse numbers safely
  const pageNum = parseInt(query.page) || 1;
  const limitNum = parseInt(query.limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const filter: any = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (query.status) {
    filter.status = query.status;
  }

  const orders = await Order.find(filter)
    .populate('userId', 'name email businessName')
    .populate('items.productId', 'name sku image')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 })
    .lean();

  const total = await Order.countDocuments(filter);

  console.log('Found orders:', orders.length);

  return { orders, total };
}


async getAllOrders(query: any): Promise<{ orders: IOrder[]; total: number }> {
  const { page = 1, limit = 10, status, paymentStatus, startDate, endDate, search } = query;
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // ✅ SEARCH FIX
  if (search) {
    const users = await User.find({
      name: { $regex: search, $options: "i" }
    }).select("_id");

    const userIds = users.map(u => u._id);

    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { userId: { $in: userIds } }
    ];
  }

  const orders = await Order.find(filter)
    .populate("userId", "name email businessName")
    .populate("items.productId", "name sku")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  return { orders, total };
  }
  

async getDailyAllOrders(query: any) {
  const { date, search } = query;

  // ✅ Default = today
  const selectedDate = date ? new Date(date) : new Date();

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);

  const pipeline: any[] = [
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lt: nextDay,
        },
      },
    },

    // explode items array
    { $unwind: "$items" },

    // join product collection
    {
      $lookup: {
        from: "productandcatelogs",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ];

  // ✅ Search by product name
  if (search) {
    pipeline.push({
      $match: {
        "product.productName": { $regex: search, $options: "i" },
      },
    });
  }

  // ✅ Group by product
  pipeline.push({
    $group: {
      _id: "$product._id",
      productName: { $first: "$product.productName" },
      date: { $first: startOfDay },
      totalOrders: { $sum: 1 },
      totalQuantity: { $sum: "$items.quantity" },
    },
  });

  // optional sorting
  pipeline.push({ $sort: { totalQuantity: -1 } });

  const result = await Order.aggregate(pipeline);

  return result;
}

  async getOrderById(orderId: string): Promise<IOrder | null> {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email businessName contact')
      .populate('items.productId', 'name sku description image');
    return order;
  }

  async cancelOrder(orderId: string, userId: string): Promise<IOrder | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error('Order not found');

      if (order.status === OrderStatus.DELIVERED) {
        throw new Error('Cannot cancel delivered order');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error('Order already cancelled');
      }

      // Restore product stock
      for (const item of order.items) {
        const product = await ProductModel.findById(item.productId).session(session);
        if (product) {
          product.stock += item.quantity;
          await product.save({ session });
        }
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      await order.save({ session });

      // Reverse credit transaction
      await this.creditService.updateOutstandingBalance(
        userId,
        -order.totalAmount,
        orderId,
        `Order cancelled - #${order.orderNumber}`
      );

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getOrderStats(): Promise<any> {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: OrderStatus.PENDING });
    const paidOrders = await Order.countDocuments({ paymentStatus: PaymentStatus.PAID });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    };
  }
}