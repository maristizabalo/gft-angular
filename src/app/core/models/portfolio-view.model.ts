import { Fund } from './fund.model';
import { Subscription } from './subscription.model';
import { Transaction } from './transaction.model';
import { User } from './user.model';

export interface UiFeedback {
  type: 'success' | 'error';
  message: string;
}

export interface FundCardViewModel extends Fund {
  hasActiveSubscription: boolean;
  activeSubscriptionId: string | null;
  subscribedAmount: number | null;
}

export interface PortfolioViewModel {
  user: User | null;
  fundCards: FundCardViewModel[];
  activeSubscriptions: Subscription[];
  transactions: Transaction[];
  loading: boolean;
  processing: boolean;
  error: string | null;
  actionFeedback: UiFeedback | null;
}