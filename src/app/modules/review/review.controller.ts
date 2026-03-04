import { Request, Response } from 'express';
import { reviewService } from './review.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

class ReviewController {
  async createReview(req: Request, res: Response) {
    const payload = {
      ...req.body,
      userId: req.user.id,
    };
    const review = await reviewService.createReview(payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'review created successfully',
      data: review,
    });
  }

  async getProductReviews(req: Request, res: Response) {
    const { productId } = req.params;
    const reviews = await reviewService.getReviewsByProduct(productId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'review created successfully',
      data: reviews,
    });
  }

    async getAllProductReviews(req: Request, res: Response) {
    const reviews = await reviewService.getAllReviewsByProduct();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'review created successfully',
      data: reviews,
    });
  }


    async deleteProductReviews(req: Request, res: Response) {
    const { id } = req.params;
    
    const reviews = await reviewService.deleteReviewsByProduct(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'review deleted successfully',
      data: reviews,
    });
  }

    async getProductFeatureList(req: Request, res: Response) {
    const lists = await reviewService.getProductFeatureList();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Feature list retrieved successfully',
      data: lists,
    });
  }
}

export const reviewController = new ReviewController();
