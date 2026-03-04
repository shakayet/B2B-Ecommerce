import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CartService } from './cart.service';

/**
 * Get my cart
 */
const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await CartService.getMyCartFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Cart retrieved successfully',
    data: result,
  });
});

/**
 * Add product to cart
 */
const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  const result = await CartService.addToCartToDB(userId, productId, quantity);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product added to cart',
    data: result,
  });
});

/**
 * Update product quantity
 */
const updateCartItemQuantity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  const result = await CartService.updateCartItemQuantityToDB(
    userId,
    productId,
    quantity
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Cart item quantity updated',
    data: result,
  });
});

/**
 * Remove item from cart
 */
const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.body;

  const result = await CartService.removeCartItemFromDB(userId, productId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Item removed from cart',
    data: result,
  });
});

/**
 * Clear cart
 */
const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await CartService.clearCartFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Cart cleared',
    data: result,
  });
});

export const CartController = {
  getMyCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
