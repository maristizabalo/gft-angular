import { NotificationMethod } from '../models/common.types';
import { Fund } from '../models/fund.model';
import { User } from '../models/user.model';

export const INITIAL_BALANCE = 500000;

export const DEFAULT_USER: User = {
  id: 1,
  fullName: 'Maicol Aristizabal',
  email: 'maicol@btg.com',
  phone: '+573106890460',
  balance: INITIAL_BALANCE,
};

export const BTG_FUNDS: ReadonlyArray<Fund> = Object.freeze([
  {
    id: 1,
    name: 'FPV_BTG_PACTUAL_RECAUDADORA',
    minimumAmount: 75000,
    category: 'FPV',
  },
  {
    id: 2,
    name: 'FPV_BTG_PACTUAL_ECOPETROL',
    minimumAmount: 125000,
    category: 'FPV',
  },
  {
    id: 3,
    name: 'DEUDAPRIVADA',
    minimumAmount: 50000,
    category: 'FIC',
  },
  {
    id: 4,
    name: 'FDO-ACCIONES',
    minimumAmount: 250000,
    category: 'FIC',
  },
  {
    id: 5,
    name: 'FPV_BTG_PACTUAL_DINAMICA',
    minimumAmount: 100000,
    category: 'FPV',
  },
]);

export const NOTIFICATION_METHOD_OPTIONS: ReadonlyArray<{
  label: string;
  value: NotificationMethod;
}> = Object.freeze([
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
]);