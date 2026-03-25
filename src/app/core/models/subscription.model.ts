import { NotificationMethod } from './common.types';

export interface Subscription {
  id: string;
  fundId: string;
  fundName: string;
  amount: number;
  notificationMethod: NotificationMethod;
  createdAt: string;
  active: boolean;
  cancelledAt?: string | null;
}