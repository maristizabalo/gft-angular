import { FundCategory } from './common.types';

export interface Fund {
  id: number;
  name: string;
  minimumAmount: number;
  category: FundCategory;
}