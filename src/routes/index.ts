import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { ProductAndcatelogRoutes } from '../app/modules/product.catelog/product.route';

import { revieweRouter } from '../app/modules/review/review.routes';
import { FavouriteRoutes } from '../app/modules/favourite/favourite.routes';
import { CustomerTypeRoutes } from '../app/modules/customer.type/customerr.type.routes';
import { CategoryRoutes } from '../app/modules/category.management/category.routes';
import { CartRoutes } from '../app/modules/addTo.cart/cart.routes';
import { FeatureProductRoutes } from '../app/modules/feature.product/feature.routes';
import { QuickBooksRoutes } from '../app/modules/quickbook/quickbook.routes';
import { OrderRoutes } from '../app/modules/order/order.route';
import { CreditRoutes } from '../app/modules/credit/credit.routes';
import { BannerRouter } from '../app/modules/banar/banar.route';
import { SocialLinkRoutes } from '../app/modules/socialLink/socialLink.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/customer-type',
    route: CustomerTypeRoutes,
  },
  {
    path: '/product&catelog',
    route: ProductAndcatelogRoutes,
  },
  {
    path: '/review',
    route: revieweRouter,
  },
  {
    path: '/banner',
    route: BannerRouter,
  },
  {
    path: '/favourite',
    route: FavouriteRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/feature-product',
    route: FeatureProductRoutes,
  },
  {
    path: '/quickbooks',
    route: QuickBooksRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/credit',
    route: CreditRoutes,
  },
  {
    path: '/social-links',
    route: SocialLinkRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
