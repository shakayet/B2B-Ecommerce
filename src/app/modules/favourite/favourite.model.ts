import { Schema, model } from 'mongoose';

const favouriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductAndCatelog',
      required: true,
    },
  },
  { timestamps: true }
);

favouriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Favourite = model('Favourite', favouriteSchema);
