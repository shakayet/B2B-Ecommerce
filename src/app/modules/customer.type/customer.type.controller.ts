import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CustomerTypeService } from './customer.type.service';

/**
 * Create customer type
 */
const createCustomerType = catchAsync(async (req: Request, res: Response) => {
  const result = await CustomerTypeService.createCustomerTypeToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Customer type created successfully',
    data: result,
  });
});

/**
 * Get all customer types (with search)
 * Query: ?searchTerm=retail
 */
const getAllCustomerTypes = catchAsync(async (req: Request, res: Response) => {
  const { searchTerm } = req.query;

  const result = await CustomerTypeService.getAllCustomerTypesFromDB(
    searchTerm as string
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer types retrieved successfully',
    data: result,
  });
});

/**
 * Get single customer type
 */
const getSingleCustomerType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result =
    await CustomerTypeService.getSingleCustomerTypeFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer type retrieved successfully',
    data: result,
  });
});

/**
 * Update customer type
 */
const updateCustomerType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result =
    await CustomerTypeService.updateCustomerTypeToDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer type updated successfully',
    data: result,
  });
});

/**
 * Delete customer type
 */
const deleteCustomerType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result =
    await CustomerTypeService.deleteCustomerTypeFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer type deleted successfully',
    data: result,
  });
});

export const CustomerTypeController = {
  createCustomerType,
  getAllCustomerTypes,
  getSingleCustomerType,
  updateCustomerType,
  deleteCustomerType,
};
