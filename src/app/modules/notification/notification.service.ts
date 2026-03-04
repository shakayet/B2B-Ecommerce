// services/notification.service.ts
import admin from '../../../config/firebase';
import {
  NotificationModel,
  NotificationHistoryModel,
} from './notification.model';
import {
  INotification,
  INotificationHistory,
  SendNotificationResult,
} from './notification.interface';
import { Types } from 'mongoose';

// Save or update FCM token when user login.

const saveFCMToken = async (
  userId: string,
  username: string,
  email: string,
  fcmToken: string
): Promise<INotification> => {
  console.log('not', fcmToken);
  const existing = await NotificationModel.findOne({ fcmToken });
  if (existing) {
    return existing;
  }
  const newNotification = new NotificationModel({
    userId,
    username,
    email,
    fcmToken,
    lastActive: new Date(),
  });
  return await newNotification.save();
};

// Send notification to all devices of a user

const CHUNK_SIZE = 200;

const sendCustomNotification = async (
  title: string,
  description: string,
  contentId?: Types.ObjectId
): Promise<SendNotificationResult> => {
  // Get all devices
  const devices = await NotificationModel.find();

  // Map tokens with userId as string
  const tokenUserMap: { token: string; userId?: string }[] = devices
    .filter(d => d.fcmToken)
    .map(d => ({ token: d.fcmToken, userId: d.userId?.toString() }));

  if (tokenUserMap.length === 0) {
    return { success: false, message: 'No devices found' };
  }

  // Split into batches
  const batches: { token: string; userId?: string }[][] = [];
  for (let i = 0; i < tokenUserMap.length; i += CHUNK_SIZE) {
    batches.push(tokenUserMap.slice(i, i + CHUNK_SIZE));
  }

  const batchResults = await Promise.all(
    batches.map(async batch => {
      const tokens = batch.map(t => t.token);

      const message: admin.messaging.MulticastMessage = {
        notification: { title, body: description },
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Save history for each token with its userId
      await Promise.all(
        batch.map(({ token, userId }) =>
          NotificationHistoryModel.create({
            title,
            description,
            fcmToken: token,
            userId,
            contentId,
          })
        )
      );

      return response;
    })
  );

  return { success: true, response: batchResults };
};

//Mark the read and unread notification...
const markNotificationAsRead = async (notificationId: string) => {
  return NotificationHistoryModel.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};
//get unmark message from notification...
const getUnreadNotifications = async (userId: string) => {
  return NotificationHistoryModel.find({ userId, read: false }).sort({
    sentAt: -1,
  });
};

// get sppecefic user notification ....
const getNotification = async (userId: string) => {
  return await NotificationHistoryModel.find({ userId }).sort({ sentAt: -1 });
};

const getNotificationForAdmin = async () => {
  return await NotificationHistoryModel.find().sort({ sentAt: -1 });
};

export const NotificationService = {
  saveFCMToken,
  sendCustomNotification,
  markNotificationAsRead,
  getUnreadNotifications,
  getNotification,
  getNotificationForAdmin,
};
