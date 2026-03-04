import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CreditService } from './credit.service';

const creditService = new CreditService();

const assignCreditLimit = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { creditLimit, reason, expiryDate } = req.body;
  const adminId = req.user.id;

  await creditService.assignCreditLimit(userId, creditLimit, adminId, reason, expiryDate);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Credit limit assigned successfully',
    data: null,
  });
});

const getCreditSummary = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await creditService.getCreditSummary(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Credit summary retrieved successfully',
    data: result,
  });
});

const getUserCreditTransactions = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await creditService.getUserCreditTransactions(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Credit transactions retrieved successfully',
    // meta: {
    //   page: parseInt(req.query.page as string) || 1,
    //   limit: parseInt(req.query.limit as string) || 20,
    //   total: result.total,
    // },
    data: result.transactions,
  });
});

const getCreditUtilizationReport = catchAsync(async (req: Request, res: Response) => {
  const result = await creditService.getCreditUtilizationReport();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Credit utilization report retrieved successfully',
    data: result,
  });
});

export const CreditController = {
  assignCreditLimit,
  getCreditSummary,
  getUserCreditTransactions,
  getCreditUtilizationReport,
};