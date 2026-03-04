import { Schema, model } from 'mongoose';
import { IQuickBooksToken } from './quickbooksToken.interface';

const quickBooksTokenSchema = new Schema<IQuickBooksToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, 
    },

    realmId: {
      type: String,
      required: true,
    },

    accessToken: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    refreshExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for fast lookup
quickBooksTokenSchema.index({ userId: 1 });
quickBooksTokenSchema.methods.isExpired = function () {
  return new Date() >= this.expiresAt;
};

export const QuickBooksToken = model<IQuickBooksToken>(
  'QuickBooksToken',
  quickBooksTokenSchema
);
