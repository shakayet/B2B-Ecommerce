import { Document, Types, Model } from 'mongoose';
import admin from 'firebase-admin';
export interface INotification extends Document {
  userId: Types.ObjectId;
  email: string;
  username: string;
  fcmToken: string;
  lastActive?: Date;
}

export interface INotificationHistory extends Document {
  userId?: Types.ObjectId;
  title: string;
  description: string;
  fcmToken?: string;
  contentId?: Types.ObjectId;
  read?: boolean;
  sentAt?: Date;
}
export interface SendNotificationResult {
  success: boolean;
  message?: string;
  response?: admin.messaging.BatchResponse[];
}
