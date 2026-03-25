import { NotificationMethod } from '../models/common.types';

export const INITIAL_USER_ID = '1';

export const NOTIFICATION_METHOD_OPTIONS: ReadonlyArray<{
  label: string;
  value: NotificationMethod;
}> = Object.freeze([
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
]);