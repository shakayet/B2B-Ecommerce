import { Types } from 'mongoose';

export interface ICreditTransaction {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  previousBalance: number;
  newBalance: number;
  createdAt?: Date;
}

export interface ICreditLimit {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  creditLimit: number;
  assignedBy: Types.ObjectId;
  reason: string;
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt?: Date;
}