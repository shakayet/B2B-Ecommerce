import { Schema, model } from 'mongoose';
import { IOrder, OrderStatus, PaymentStatus } from './order.interface';

// Sub-schema for order items
const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductAndCatelog',
      required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    quickbooksItemId: { type: String }
  },
  { _id: false }
);

// Sub-schema for addresses
const addressSchema = new Schema(
  {
    line1: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'US' },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentLink: { type: String },
    quickbooksInvoiceId: { type: String },
    invoiceNumber: { type: String },
    invoiceUrl: { type: String },
    dueDate: { type: Date, required: true },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema },
    notes: { type: String },
    deliveryDate: { type: Date },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);
