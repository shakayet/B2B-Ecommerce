import { User } from '../user/user.model';
import { CreditTransaction, CreditLimit } from './credit.model';
import mongoose, { Types } from 'mongoose';

export class CreditService {
async assignCreditLimit(
  userId: string,
  creditLimit: number,
  assignedBy: string,
  reason: string,
  expiryDate?: Date
): Promise<void> {
  // Start a session for transaction
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Load the user with the session
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    // Save credit limit history
    const creditLimitRecord = new CreditLimit({
      userId,
      creditLimit,
      assignedBy: new mongoose.Types.ObjectId(assignedBy),
      reason,
      effectiveDate: new Date(),
      expiryDate
    });
    await creditLimitRecord.save({ session });

    // Update user's credit info safely using updateOne
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          'creditInfo.creditLimit': creditLimit,
          'creditInfo.availableCredit': creditLimit - (user.creditInfo?.currentOutstanding || 0),
          'creditInfo.creditStatus': this.calculateCreditStatus(
            creditLimit,
            user.creditInfo?.currentOutstanding || 0
          ),
          'creditInfo.lastUpdated': new Date()
        }
      },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    // Abort if anything fails
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
}


async updateOutstandingBalance(
  userId: string,
  amount: number,
  orderId: string,
  description: string,
  session?: mongoose.ClientSession
): Promise<void> {

  const ownsSession = !session;
  const dbSession = session || await mongoose.startSession();

  if (ownsSession) dbSession.startTransaction();

  try {
    const user = await User.findById(userId).session(dbSession);
    if (!user) throw new Error('User not found');

    const previousBalance = user.creditInfo?.currentOutstanding || 0;
    const newBalance = previousBalance + amount;

    const transaction = new CreditTransaction({
      userId,
      orderId,
      amount: Math.abs(amount),
      type: amount > 0 ? 'debit' : 'credit',
      description,
      previousBalance,
      newBalance
    });

    await transaction.save({ session: dbSession });

    user.creditInfo = {
      ...user.creditInfo,
      currentOutstanding: newBalance,
      availableCredit: (user.creditInfo?.creditLimit || 0) - newBalance,
      creditStatus: this.calculateCreditStatus(
        user.creditInfo?.creditLimit || 0,
        newBalance
      ),
      lastUpdated: new Date()
    };

    await user.save({ session: dbSession });

    if (ownsSession) {
      await dbSession.commitTransaction();
    }

  } catch (error) {

    if (ownsSession) {
      await dbSession.abortTransaction();
    }

    throw error;

  } finally {

    if (ownsSession) {
      dbSession.endSession();
    }
  }
}


  async checkCreditAvailability(userId: string, orderAmount: number): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    const availableCredit = user.creditInfo?.availableCredit || 0;
    const creditStatus = user.creditInfo?.creditStatus;

    // Block if credit status is blocked or insufficient credit
    if (creditStatus === 'blocked') return false;
    if (availableCredit < orderAmount) return false;

    return true;
  }

  async getCreditSummary(userId: string): Promise<any> {
    const user = await User.findById(userId).select('creditInfo name email businessName');
    if (!user) throw new Error('User not found');

    const recentTransactions = await CreditTransaction.find({ userId })
      .populate('orderId', 'orderNumber totalAmount')
      .sort({ createdAt: -1 })
      .limit(20);

    const creditHistory = await CreditLimit.find({ userId })
      .populate('assignedBy', 'name email')
      .sort({ effectiveDate: -1 });

    return {
      currentCreditInfo: user.creditInfo,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      recentTransactions,
      creditHistory
    };
  }

async getUserCreditTransactions(
  userId: string,
  query: { page?: number; limit?: number } = {}
): Promise<{ transactions: any[]; total: number }> {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  // Fetch transactions
  const transactions = await CreditTransaction.find({ userId })
    .populate('userId', 'name email')        // who the transaction belongs to
    .populate('orderId', 'orderNumber totalAmount') // optional: link to order
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Count total
  const total = await CreditTransaction.countDocuments({ userId });

  return { transactions, total };
}


  async getCreditUtilizationReport(): Promise<any> {
    const users = await User.find({
      'creditInfo.creditLimit': { $gt: 0 }
    }).select('name email businessName creditInfo');

    const report = users.map(user => ({
      userId: user._id,
      businessName: user.businessName,
      email: user.email,
      creditLimit: user.creditInfo.creditLimit,
      currentOutstanding: user.creditInfo.currentOutstanding,
      availableCredit: user.creditInfo.availableCredit,
      utilizationPercentage: (user.creditInfo.currentOutstanding / user.creditInfo.creditLimit) * 100,
      status: user.creditInfo.creditStatus
    }));

    return report;
  }

  private calculateCreditStatus(creditLimit: number, outstanding: number): 'good' | 'near limit' | 'blocked' {
    if (creditLimit === 0) return 'good';
    
    const usagePercentage = (outstanding / creditLimit) * 100;

    if (usagePercentage >= 100) {
      return 'blocked';
    } else if (usagePercentage >= 80) {
      return 'near limit';
    } else {
      return 'good';
    }
  }
}