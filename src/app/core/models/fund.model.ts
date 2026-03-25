import { FundCategory } from './common.types';

export interface Fund {
  id: string;
  name: string;
  minimumAmount: number;
  category: FundCategory;
}