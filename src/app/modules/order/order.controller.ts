import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';

const orderService = new OrderService();

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const orderData = req.body;

  const result = await orderService.createOrder(userId, orderData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Order created successfully. Invoice and payment link sent to email.',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await orderService.getUserOrders(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Orders retrieved successfully',
    data: result.orders,
  });
});

const getMyOrdersForAdmin = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await orderService.getUserOrders(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Orders retrieved successfully',
    data: result.orders,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getAllOrders(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'AllOrders retrieved successfully',
    // meta: {
    //   page: parseInt(req.query.page as string) || 1,
    //   limit: parseInt(req.query.limit as string) || 10,
    //   total: result.total,
    // },
    data: result.orders,
  });
});

const getDailyAllProductOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getDailyAllOrders(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All Daily Product Orders retrieved successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await orderService.getOrderById(orderId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order details retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const result = await orderService.updateOrderStatus(orderId, status);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order status updated successfully',
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const result = await orderService.cancelOrder(orderId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order cancelled successfully',
    data: result,
  });
});

const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getOrderStats();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order statistics retrieved successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getDailyAllProductOrders,
  getMyOrdersForAdmin,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
};