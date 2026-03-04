import { Types } from 'mongoose';
import { IReview } from './review.interface';
import { ReviewModel } from './review.model';

class ReviewService {
  async createReview(payload: IReview) {
    return await ReviewModel.create(payload);
  }

  async getReviewsByProduct(productId: string) {
    return await ReviewModel.find({
      productId: new Types.ObjectId(productId),
    })
      .populate('userId', 'name email image ')
      .populate('productId', 'productName')
      .sort({ createdAt: -1 });
  }

    async getAllReviewsByProduct() {
    return await ReviewModel.find()
      .populate('userId', 'name email image ')
      .populate('productId', 'productName')
      .sort({ createdAt: -1 });
  }
  async deleteReviewsByProduct(id: string) { 
    return await ReviewModel.findByIdAndDelete({
      _id: new Types.ObjectId(id),
      
    });
  } 
  
async getProductFeatureList() {
  const products = await ReviewModel.aggregate([
    // 1️⃣ Only good reviews
    {
      $match: { rating: { $gte: 4 } },
    },

    // 2️⃣ Unique products + rating stats
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },

    // 3️⃣ Join product collection
    {
      $lookup: {
        from: 'productandcatelogs',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },

    // 4️⃣ Convert array → object
    { $unwind: '$product' },

    // 5️⃣ Add stock status
    {
      $addFields: {
        'product.stockStatus': {
          $cond: [
            { $gt: ['$product.stock', 0] },
            'available',
            'out_of_stock',
          ],
        },
      },
    },

    // 6️⃣ Merge everything into root
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$product',
            {
              avgRating: '$avgRating',
              reviewCount: '$reviewCount',
            },
          ],
        },
      },
    },

    // 7️⃣ Sort best rated first
    {
      $sort: { avgRating: -1 },
    },
  ]);

  return products;
}



}

export const reviewService = new ReviewService();
