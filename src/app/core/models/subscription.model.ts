import { NotificationMethod } from './common.types';

export interface Subscription {
  id: number;
  fundId: number;
  fundName: string;
  amount: number;
  notificationMethod: NotificationMethod;
  createdAt: string;
  active: boolean;
  cancelledAt?: string | null;
}