// src/modules/banner/banner.controller.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  createAndUpdateBannerService,
  getBannerService,
  deleteBannerImageByIdService,
} from './banar.service';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

/**
 * Upload or update banners
 */
export const createAndUpdateBannerController = catchAsync(
  async (req: Request, res: Response) => {
    const webBannersFiles = getMultipleFilesPath(req.files, 'webBanner') || [];
    const mobileBannersFiles = getMultipleFilesPath(req.files, 'mobileBanner') || [];

    const webBanners = webBannersFiles.map((filePath) => ({ image: filePath }));
    const mobileBanners = mobileBannersFiles.map((filePath) => ({ image: filePath }));

    const result = await createAndUpdateBannerService({
      webBanners,
      mobileBanners,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Banner created or updated successfully',
      data: result,
    });
  }
);

/**
 * Get banners
 */
export const getBannerController = catchAsync(
  async (req: Request, res: Response) => {
    const banners = await getBannerService();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Banners retrieved successfully',
      data: banners,
    });
  }
);

/**
 * Delete a specific banner image by type and index
 */
export const deleteBannerImageByIndexController = catchAsync(
  async (req: Request, res: Response) => {
    const { type, banarId } = req.params;
    const result = await deleteBannerImageByIdService(
      type as 'web' | 'mobile',
      banarId
    );

    if (!result) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Banner image not found or invalid index',
      });
    }

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Banner image deleted successfully',
      data: result,
    });
  }
);
