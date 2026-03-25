import { Fund } from './fund.model';
import { Subscription } from './subscription.model';
import { Transaction } from './transaction.model';
import { User } from './user.model';

export interface FundCardViewModel extends Fund {
  hasActiveSubscription: boolean;
  subscribedAmount: number | null;
}

export interface PortfolioViewModel {
  user: User | null;
  fundCards: FundCardViewModel[];
  activeSubscriptions: Subscription[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}