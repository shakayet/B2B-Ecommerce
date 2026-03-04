import { Router } from 'express';
import { reviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = Router();

router.post(
  '/',
  auth(USER_ROLES.USER),
  reviewController.createReview
);

router.get(
  '/:productId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  reviewController.getProductReviews
);

router.get(
  '/',
  reviewController.getAllProductReviews
);

router.get(
  '/features/list',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  reviewController.getProductFeatureList
);  

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  reviewController.deleteProductReviews
);

export const revieweRouter = router;
