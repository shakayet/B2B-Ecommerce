import { Types } from 'mongoose';
import { FeatureProduct } from './feature.model';



/**
 * Toggle favourite (add/remove)
 */
const toggleFeatureProductToDB = async ( productId: string) => {
  const exists = await FeatureProduct.findOne({productId });

  if (exists) {
    await FeatureProduct.deleteOne({ _id: exists._id });
    return { isFeatureProduct: false };
  }

  await FeatureProduct.create({ productId });
  return { isFeatureProduct: true };
};

/**
 * Get user's feature products
 */

const getUserFeatureProductsFromDB = async () => {
  const featureProducts = await FeatureProduct.aggregate([

    // 2️⃣ Join Product collection
    {
      $lookup: {
        from: 'productandcatelogs', // ⚠️ must match actual collection name
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },

    // 3️⃣ Convert product array → object
    {
      $unwind: '$product',
    },
  ]);

  return featureProducts;
};





export const FeatureProductService = {
  toggleFeatureProductToDB,
  getUserFeatureProductsFromDB,
};