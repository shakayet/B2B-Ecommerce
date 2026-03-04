import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { QuickBooksConfig } from './quickbook.config';
import { checkQuickBooksConnection, QuickBooksService } from './quickbook.service';
import { QuickBooksToken } from './quickbooksToken.model';


const quickBooksService = new QuickBooksService();

const qbConfig = QuickBooksConfig.getInstance();
const qbService = new QuickBooksService();

const getAuthUrl = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; // Assuming user ID is available in the request object
  const authUrl = qbConfig.getAuthUrl(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'QuickBooks auth URL generated successfully',
    data: { authUrl },
  });
});

const handleCallback = catchAsync(
  async (req: Request, res: Response) => {
    const { code, realmId, state } = req.query;

    if (!code || !realmId || !state) {
      throw new Error('Invalid callback parameters');
    }

    // Decode state to get userId
    const decoded = JSON.parse(
      Buffer.from(state as string, 'base64').toString()
    );
    const userId = decoded.userId;

    // Exchange code for tokens
    const tokenData = await qbConfig.getAccessToken(code as string);
    console.log('Received QB token data:', tokenData);

    // Save or update token in DB
    await QuickBooksToken.findOneAndUpdate(
      { userId },
      {
        userId,
        realmId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
      { upsert: true, new: true }
    );

    // Response to frontend
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'QuickBooks connected successfully',
      data: { realmId, ...tokenData },
    });
  }
);

// Controller method to check connection status for quickbookase on userId
const checkConnection = catchAsync(async (req: Request, res: Response) => {
const userId = req.user?.id; 
const status = await checkQuickBooksConnection(userId);

sendResponse(res, {
  success: true,
  statusCode: 200,
  message: 'QuickBooks connection status',
  data: status,
});

});

const getInvoice = catchAsync(async (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const token = await quickBooksService.getValidToken();
  const invoice = await qbService.getInvoice(invoiceId, token?.realmId || '', token?.accessToken || '');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invoice retrieved successfully',
    data: invoice,
  });
});

export const QuickBooksController = {
  getAuthUrl,
  handleCallback,
  checkConnection,
  getInvoice,
};