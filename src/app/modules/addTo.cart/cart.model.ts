import { Schema, model } from 'mongoose';
import { ICart, ICartItem } from './cart.interface';

/**
 * Schema for each cart item
 */
const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'ProductAndCatelog',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

/**
 * Cart Schema
 */
const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, 
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

export const CartModel = model<ICart>('CartProduct', cartSchema);
