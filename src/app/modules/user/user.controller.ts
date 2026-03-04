import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  },
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  },
);
// update the user status and customer type.

const updateUserStatusAndCustomerType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const { status, customerType } = req.body;
    const result = await UserService.updateUserProfileStatusToDB(
      userId,
      status,
      customerType,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User updated successfully',
      data: result,
    });
  },
);

//get all user.

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await UserService.getAllUsersFromDB(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

const syncWithQuickBooks = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.syncWithQuickBooks(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User synced with QuickBooks successfully',
    data: result,
  });
});

const assignCreditLimit = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { creditLimit, reason, expiryDate } = req.body;
  const adminId = req.user.id;

  const result = await UserService.assignCreditLimit(
    userId,
    creditLimit,
    adminId,
    reason,
    expiryDate,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Credit limit assigned successfully',
    data: result,
  });
});

const getUserCreditSummary = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await UserService.getUserCreditSummary(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Credit summary retrieved successfully',
    data: result,
  });
});

// Admin role management

const addAdmin = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await UserService.addAdmin(name, email, password);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin role added successfully',
    data: result,
  });
});

// Get all admins
const getAdmins = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await UserService.getAdmins(query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admins retrieved successfully',
    data: result,
  });
});
//remove admin
const removeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await UserService.removeAdmin(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin role removed successfully',
    data: result,
  });
});
//update admin
const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;
  const result = await UserService.updateAdmin(userId, name, email, password);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin role updated successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  getAllUsers,
  updateProfile,
  updateUserStatusAndCustomerType,
  assignCreditLimit,
  getUserCreditSummary,
  syncWithQuickBooks,
  // Admin role management
  addAdmin,
  getAdmins,
  removeAdmin,
  updateAdmin,
};
