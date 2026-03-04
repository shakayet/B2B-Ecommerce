import { Types } from 'mongoose';
import { Favourite } from './favourite.model';

/**
 * Toggle favourite (add/remove)
 */
const toggleFavouriteToDB = async (userId: string, productId: string) => {
  const exists = await Favourite.findOne({ userId, productId });

  if (exists) {
    await Favourite.deleteOne({ userId, productId });
    return { isFavourite: false };
  }

  await Favourite.create({ userId, productId });
  return { isFavourite: true };
};

/**
 * Get user's favourites
 */

const getUserFavouritesFromDB = async (userId: string) => {
  const favourites = await Favourite.aggregate([
    // 1️⃣ Match user's favourites
    {
      $match: {
        userId: new Types.ObjectId(userId), // change if stored as string
      },
    },

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

  return favourites;
};





export const FavouriteService = {
  toggleFavouriteToDB,
  getUserFavouritesFromDB,
};