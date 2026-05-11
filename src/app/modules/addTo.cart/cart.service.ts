import { Types } from 'mongoose';
import { CartModel } from './cart.model';

const getMyCartFromDB = async (userId: string) => {
  const cart = await CartModel.findOne({ user: userId }).populate('items.product');
  return cart;
};

const addToCartToDB = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const userObjectId = new Types.ObjectId(userId);
  const productObjectId = new Types.ObjectId(productId);

  let cart = await CartModel.findOne({ user: userObjectId });

  if (!cart) {
    cart = await CartModel.create({
      user: userObjectId,
      items: [{ product: productObjectId, quantity }],
    });
    return cart;
  }

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

const removeCartItemFromDB = async (userId: string, productId: string) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();
  return cart;
};

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
