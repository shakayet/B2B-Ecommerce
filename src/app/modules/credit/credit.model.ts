import { Schema, model } from 'mongoose';
import { ICreditTransaction, ICreditLimit } from './credit.interface';

const creditTransactionSchema = new Schema<ICreditTransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  description: { type: String, required: true },
  previousBalance: { type: Number, required: true },
  newBalance: { type: Number, required: true }
}, {
  timestamps: true
});

const creditLimitSchema = new Schema<ICreditLimit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creditLimit: { type: Number, required: true, min: 0 },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  effectiveDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }
}, {
  timestamps: true
});

export const CreditTransaction = model<ICreditTransaction>('CreditTransaction', creditTransactionSchema);
export const CreditLimit = model<ICreditLimit>('CreditLimit', creditLimitSchema);