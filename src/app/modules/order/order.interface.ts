import { Document, Types } from 'mongoose';

// Enum for order status
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
}

// Enum for payment status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Address interface
export interface IAddress {
  line1: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Order item interface
export interface IOrderItem {
  productId: Types.ObjectId | string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  quickbooksItemId?: string;
}

// Main order interface
export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId | string;
  items: IOrderItem[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;

  paymentLink?: string;
  quickbooksInvoiceId?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;

  dueDate: Date;
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  deliveryDate?: Date;
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
