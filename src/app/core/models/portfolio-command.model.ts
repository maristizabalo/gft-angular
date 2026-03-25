import { NotificationMethod } from './common.types';

export interface SubscribeToFundCommand {
  fundId: string;
  amount: number;
  notificationMethod: NotificationMethod;
}