import { Schema, model } from 'mongoose';

const featureSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductAndCatelog',
      required: true,
    },
  },
  { timestamps: true }
);

featureSchema.index({ productId: 1 }, { unique: true });

export const FeatureProduct = model('FeatureProduct', featureSchema);