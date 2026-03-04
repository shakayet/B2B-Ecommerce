import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
export interface IQueryOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ICreditInfo {
  creditLimit: number;
  currentOutstanding: number;
  availableCredit: number;
  creditStatus: 'good' | 'near limit' | 'blocked';
  lastUpdated: Date;
}
export type IUser = {
  name: string;
  businessType: string;
  businessName: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  fcmToken: string;
  businessAddress: string;
  image?: string;
  status: 'pending' | 'approve' | 'reject' | 'block' | 'unblock';
  customerType: string;
  isActive: 'active' | 'inActive';
  quickbooksId?: string; // QuickBooks Customer ID
  creditInfo: ICreditInfo;
  verified: boolean;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
