import { Types } from 'mongoose';

/**
 * Single product inside cart
 */
export interface ICartItem {
  product: Types.ObjectId; 
  quantity: number;
}

/**
 * Cart Interface
 */
export interface ICart {
  user: Types.ObjectId;      
  items: ICartItem[];             
}
