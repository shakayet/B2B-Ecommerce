import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

/**
 * Create Category
 */
const createCategory = catchAsync(async (req: Request, res: Response) => {
    const image =  getSingleFilePath(req.files, 'image');
    const payload = { ...req.body, image };
  const result = await CategoryService.createCategoryToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Category created successfully',
    data: result,
  });
});

/**
 * Get All Categories
 */
const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await CategoryService.getAllCategoriesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

/**
 * Get Single Category by ID
 */
const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.getSingleCategoryFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category retrieved successfully',
    data: result,
  });
});

/**
 * Update Category
 */
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image =  getSingleFilePath(req.files, 'image');
const payload = { ...req.body, image };     
  const result = await CategoryService.updateCategoryToDB(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

/**
 * Delete Category
 */
const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryService.deleteCategoryFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
