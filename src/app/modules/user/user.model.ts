import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { model, Schema, HydratedDocument, Model } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';

// Use HydratedDocument<IUser> to get isNew, isModified, _id, etc.
type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser, UserModal>(
  {
    name: { type: String, required: true },
    businessName: { type: String },
    businessType: { type: String },
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    quickbooksId: { type: String },
    creditInfo: {
      creditLimit: { type: Number, default: 0 },
      currentOutstanding: { type: Number, default: 0 },
      availableCredit: { type: Number, default: 0 },
      creditStatus: {
        type: String,
        enum: ['good', 'near limit', 'blocked'],
        default: 'good',
      },
      lastUpdated: { type: Date, default: Date.now },
    },
    contact: { type: String },
    businessAddress: { type: String },
    password: { type: String, required: true, select: false, minlength: 8 },
    image: { type: String, default: 'https://i.ibb.co/z5YHLV9/profile.png' },
    status: {
      type: String,
      enum: ['pending', 'approve', 'reject', 'block', 'unblock'],
      default: 'pending',
    },
    customerType: {
      type: String,
      lowercase: true,
      trim: true,
      default: 'base customer',
    },
    isActive: { type: String, enum: ['active', 'inActive'], default: 'active' },
    fcmToken: { type: String },
    verified: { type: Boolean, default: true },
    authentication: {
      type: {
        isResetPassword: { type: Boolean, default: false },
        oneTimeCode: { type: Number, default: null },
        expireAt: { type: Date, default: null },
      },
      select: false,
    },
  },
  { timestamps: true },
);

// ✅ Pre-save hook with proper TypeScript types
userSchema.pre<UserDocument>('save', async function () {
  const user = this;

  // Cast constructor to Mongoose model
  const UserModel = user.constructor as Model<IUser>;

  // Only check email if new or modified
  if (user.isNew || user.isModified('email')) {
    const isExist = await UserModel.findOne({
      email: user.email,
      _id: { $ne: user._id }, // exclude current document
    });

    if (isExist) {
      throw new ApiError(400, 'Email already exists!');
    }
  }

  // Hash password if new or modified
  if (user.isNew || user.isModified('password')) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
});

// Static methods
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id);
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};

export const User = model<IUser, UserModal>('User', userSchema);
