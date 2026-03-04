import express from 'express';
import { CategoryController } from './category.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

/**
 * Category Routes
 */
router.post('/',fileUploadHandler(), CategoryController.createCategory);
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getSingleCategory);
router.patch('/:id',fileUploadHandler(), CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export const CategoryRoutes = router;
