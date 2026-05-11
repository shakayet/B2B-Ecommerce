import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { CreditService } from '../credit/credit.service';
import { QuickBooksService } from '../quickbook/quickbook.service';
import { IQueryOptions, IUser } from './user.interface';
import { User } from './user.model';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }
  payload.role = USER_ROLES.USER;
  payload.creditInfo = {
    creditLimit: 0,
    currentOutstanding: 0,
    availableCredit: 0,
    creditStatus: 'good',
    lastUpdated: new Date(),
  };
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } },
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const updateUserProfileStatusToDB = async (
  id: string,
  status?: string,
  customerType?: string,
) => {
  const updateData: Partial<{ status: string; customerType: string }> = {};

  const allowedStatuses = ['pending', 'approve', 'block', 'unblock', 'reject'];

  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user status value');
    }
    updateData.status = status;
  }

  if (customerType !== undefined) {
    const formattedCustomerType = customerType.trim().toLowerCase();
    if (!formattedCustomerType) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Customer type cannot be empty',
      );
    }
    updateData.customerType = formattedCustomerType;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No fields provided to update');
  }

  // Update and return the user in a single DB operation
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updatedUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Send admin approval email asynchronously (don't block the DB operation)
  const emailData = {
    title: status
      ? 'Admin Approved'
      : `Your category updated to ${customerType}.`,
    email: updatedUser.email,
  };

  // Fire and forget
  emailHelper
    .sendEmail(emailTemplate.adminApprovalEmail(emailData))
    .catch(err => {
      console.error('Failed to send admin approval email:', err);
    });

  return updatedUser;
};

const getAllUsersFromDB = async (query: IQueryOptions) => {
  const { search, status, page = 1, limit = 10 } = query;

  const filter: any = {
    role: { $ne: 'ADMIN' },
  };

  // Optional search by name or email
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Optional filter by status
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  // Fetch users with pagination
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password')
    .lean();

  return users;
};

const syncWithQuickBooks = async (userId: string): Promise<Partial<IUser>> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const quickBooksService = new QuickBooksService();

    const token = await quickBooksService.getValidToken();
    if (!token) {
      throw new Error('QuickBooks token not found');
    }

    if (!user.quickbooksId) {
      const qbCustomerId = await quickBooksService.createCustomer(
        user,
        token?.realmId,
        token?.accessToken,
      );

      console.log('Saving QuickBooks ID to user...');

      user.quickbooksId = qbCustomerId;

      await user.save();

      console.log('User saved successfully');
    }

    const { password, ...safeUser } = user.toObject();

    return safeUser;
  } catch (error: any) {
    console.error('REAL ERROR:', error);

    throw error;
  }
};

const assignCreditLimit = async (
  userId: string,
  creditLimit: number,
  assignedBy: string,
  reason: string,
  expiryDate?: Date,
): Promise<Partial<IUser>> => {
  const creditService = new CreditService();
  await creditService.assignCreditLimit(
    userId,
    creditLimit,
    assignedBy,
    reason,
    expiryDate,
  );

  const user = await User.findById(userId).select('-password');
  return user!;
};

const getUserCreditSummary = async (userId: string): Promise<any> => {
  const creditService = new CreditService();
  return await creditService.getCreditSummary(userId);
};

// Admin role management

const addAdmin = async (name: string, email: string, password: string) => {
  const admin = await User.create({
    name,
    email,
    password,
    role: USER_ROLES.ADMIN,
    status: 'approve',

    verified: true,
    customerType: 'individual',
  });
  return admin;
};

const getAdmins = async (query: any) => {
  const { search, status, page = 1, limit = 10 } = query;

  const filter: any = {
    role: USER_ROLES.ADMIN,
  };

  // Optional search by name or email
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Optional filter by status
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const admins = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password')
    .lean();

  return {
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: admins.length,
      totalPage: Math.ceil(admins.length / Number(limit)),
    },
    data: admins,
  };
};

const removeAdmin = async (userId: string) => {
  const admin = await User.findByIdAndDelete(userId);
  return admin;
};

const updateAdmin = async (
  userId: string,
  name: string,
  email: string,
  password: string,
) => {
  const admin = await User.findByIdAndUpdate(
    userId,
    {
      name,
      email,
      password,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  return admin;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  updateUserProfileStatusToDB,
  getAllUsersFromDB,
  syncWithQuickBooks,
  assignCreditLimit,
  getUserCreditSummary,
  // Admin role management
  addAdmin,
  getAdmins,
  removeAdmin,
  updateAdmin,
};
