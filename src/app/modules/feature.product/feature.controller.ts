import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FeatureProductService } from './feature.service';


/**
 * Toggle favourite
 */
const toggleFeatureProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.body;

  const result = await FeatureProductService.toggleFeatureProductToDB
  (productId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feature product updated',
    data: result,
  });
});

/**
 * Get user's favourites
 */
const getMyFeatureProducts = catchAsync(async (req: Request, res: Response) => {


  const result = await FeatureProductService.getUserFeatureProductsFromDB();
  console.log(result);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Feature product list retrieved',
    data: result,
  });
});

export const FeatureProductController = {
  toggleFeatureProduct,
  getMyFeatureProducts,
};
