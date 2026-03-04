import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FavouriteService } from './favourite.service';

/**
 * Toggle favourite
 */
const toggleFavourite = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id; // from auth middleware
  const { productId } = req.body;

  const result = await FavouriteService.toggleFavouriteToDB(userId, productId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Favourite updated',
    data: result,
  });
});

/**
 * Get user's favourites
 */
const getMyFavourites = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await FavouriteService.getUserFavouritesFromDB(userId);
  console.log(result);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Favourite list retrieved',
    data: result,
  });
});

export const FavouriteController = {
  toggleFavourite,
  getMyFavourites,
};
