import {
  NotificationMethod,
  TransactionStatus,
  TransactionType,
} from './common.types';

export interface Transaction {
  id: string;
  fundId: string;
  fundName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  message: string;
  createdAt: string;
  previousBalance: number;
  currentBalance: number;
  notificationMethod?: NotificationMethod;
}