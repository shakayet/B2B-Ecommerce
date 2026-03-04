import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SocialLinkService } from './socialLink.service';
// social management
const createSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const result = await SocialLinkService.createSocialLinks(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Social links saved successfully',
    data: result,
  });
});

const getSocialLinks = catchAsync(async (req: Request, res: Response) => {
  const result = await SocialLinkService.getSocialLinks();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Social links retrieved successfully',
    data: result,
  });
});

export const SocialLinkController = {
  createSocialLinks,
  getSocialLinks,
};
