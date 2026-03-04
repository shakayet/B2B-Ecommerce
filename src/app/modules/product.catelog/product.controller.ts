import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductService } from './product.service';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { CategoryModel } from '../category.management/category.model';

/**
 * Create product
 */
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  const category = req.body.category;
  const categoryIds = await CategoryModel.findOne({
    categoryName: category,
  }).select('_id');
  if (categoryIds) {
    req.body.categoryId = categoryIds._id;
  }
  const payload = {
    ...req.body,
    image,
    customerTypePrice: req.body.customerTypePrice
      ? JSON.parse(req.body.customerTypePrice)
      : [],
  };

  const result = await ProductService.createProductToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Product created successfully',
    data: result,
  });
});

/**
 * Get all products (with search)
 * Query: ?searchTerm=rice
 */
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const { search, category, page = 1, limit } = req.query;

  const result = await ProductService.getAllProductsFromDB({
    search: search as string,
    category: category as string,
    page: page as string,
    limit: limit as string,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully',
    data: result,
  });
});

/**
 * Get single product
 */
const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductService.getSingleProductFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: result,
  });
});

/**
 * Update product
 */
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files, 'image');
  const payload = { ...req.body, image };
  const result = await ProductService.updateProductToDB(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product updated successfully',
    data: result,
  });
});

/**
 * Delete product
 */
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductService.deleteProductFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product deleted successfully',
    data: result,
  });
});

const getAllProductsCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getAllProductsCategoryFromDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Products retrieved successfully',
      data: result,
    });
  },
);

const getAllProductsByCustomerType = catchAsync(
  async (req: Request, res: Response) => {
    const { search, category } = req.query;
    const userId = req.user?.id;
    const result = await ProductService.getAllProductsByCustomerTypeFromDB(
      { search: search as string, category: category as string },
      userId,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Products retrieved successfully',
      data: result,
    });
  },
);

export const ProductController = {
  createProduct,
  getAllProducts,
  getAllProductsByCustomerType,
  getSingleProduct,
  getAllProductsCategory,
  updateProduct,
  deleteProduct,
};
