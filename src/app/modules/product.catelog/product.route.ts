import { Router } from 'express';
import { ProductController } from './product.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = Router();
router.get(
  '/customer-type',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ProductController.getAllProductsByCustomerType,
);
router.post('/', fileUploadHandler(), ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getSingleProduct);
router.patch('/:id', fileUploadHandler(), ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.get('/categories/all', ProductController.getAllProductsCategory);
export const ProductAndcatelogRoutes = router;
