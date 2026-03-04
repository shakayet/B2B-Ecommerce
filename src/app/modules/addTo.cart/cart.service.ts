import { Types } from 'mongoose';
import { CartModel } from './cart.model';

/**
 * Get logged-in user's cart
 */
const getMyCartFromDB = async (userId: string) => {
  const cart = await CartModel.findOne({ user: userId }).populate('items.product');
  return cart;
};

/**
 * Add product to cart OR increase quantity if already exists
 */
const addToCartToDB = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const userObjectId = new Types.ObjectId(userId);
  const productObjectId = new Types.ObjectId(productId);

  let cart = await CartModel.findOne({ user: userObjectId });

  // Create cart if not exists
  if (!cart) {
    cart = await CartModel.create({
      user: userObjectId,
      items: [{ product: productObjectId, quantity }],
    });
    return cart;
  }

  // Check existing product
  const existingItem = cart.items.find(
    item => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productObjectId,
      quantity,
    });
  }

  await cart.save();
  return cart;
};

/**
 * Update quantity of specific product in cart
 */
const updateCartItemQuantityToDB = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  const item = cart.items.find(i => i.product.toString() === productId);
  if (!item) throw new Error('Product not in cart');

  item.quantity = quantity;

  await cart.save();
  return cart;
};

/**
 * Remove one product from cart
 */
const removeCartItemFromDB = async (userId: string, productId: string) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();
  return cart;
};

/**
 * Clear entire cart
 */
const clearCartFromDB = async (userId: string) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  cart.items = [];

  await cart.save();
  return cart;
};

export const CartService = {
  getMyCartFromDB,
  addToCartToDB,
  updateCartItemQuantityToDB,
  removeCartItemFromDB,
  clearCartFromDB,
};
