import { Document, Types } from 'mongoose';

export interface IQuickBooksToken extends Document {
  userId: Types.ObjectId;
  realmId: string;

  accessToken: string;
  refreshToken: string;

  expiresAt: Date;        
  refreshExpiresAt?: Date; 

  isExpired(): boolean;
  createdAt: Date;
  updatedAt: Date;
}