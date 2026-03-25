import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  finalize,
  forkJoin,
  map,
} from 'rxjs';

import { Fund } from '../../../core/models/fund.model';
import { PortfolioViewModel } from '../../../core/models/portfolio-view.model';
import { Subscription } from '../../../core/models/subscription.model';
import { Transaction } from '../../../core/models/transaction.model';
import { User } from '../../../core/models/user.model';
import { FundsApiService } from '../../../core/services/funds-api.service';
import { SubscriptionsApiService } from '../../../core/services/subscriptions-api.service';
import { TransactionsApiService } from '../../../core/services/transactions-api.service';
import { UsersApiService } from '../../../core/services/users-api.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioStoreService {
  private readonly usersApiService = inject(UsersApiService);
  private readonly fundsApiService = inject(FundsApiService);
  private readonly subscriptionsApiService = inject(SubscriptionsApiService);
  private readonly transactionsApiService = inject(TransactionsApiService);

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly fundsSubject = new BehaviorSubject<Fund[]>([]);
  private readonly subscriptionsSubject = new BehaviorSubject<Subscription[]>([]);
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  private hasLoaded = false;
  private isLoading = false;

  readonly user$ = this.userSubject.asObservable();
  readonly funds$ = this.fundsSubject.asObservable();
  readonly subscriptions$ = this.subscriptionsSubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  readonly activeSubscriptions$ = this.subscriptions$.pipe(
    map((subscriptions) =>
      subscriptions.filter((subscription) => subscription.active),
    ),
  );

  readonly portfolioViewModel$ = combineLatest({
    user: this.user$,
    funds: this.funds$,
    activeSubscriptions: this.activeSubscriptions$,
    transactions: this.transactions$,
    loading: this.loading$,
    error: this.error$,
  }).pipe(
    map(
      ({
        user,
        funds,
        activeSubscriptions,
        transactions,
        loading,
        error,
      }): PortfolioViewModel => ({
        user,
        fundCards: funds.map((fund) => {
          const activeSubscription = activeSubscriptions.find(
            (subscription) => subscription.fundId === fund.id,
          );

          return {
            ...fund,
            hasActiveSubscription: Boolean(activeSubscription),
            subscribedAmount: activeSubscription?.amount ?? null,
          };
        }),
        activeSubscriptions,
        transactions,
        loading,
        error,
      }),
    ),
  );

  ensureLoaded(): void {
    if (this.hasLoaded || this.isLoading) {
      return;
    }

    this.load();
  }

  reload(): void {
    this.hasLoaded = false;
    this.load();
  }

  private load(): void {
    this.isLoading = true;
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    forkJoin({
      user: this.usersApiService.getUser(),
      funds: this.fundsApiService.getFunds(),
      subscriptions: this.subscriptionsApiService.getSubscriptions(),
      transactions: this.transactionsApiService.getTransactions(),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loadingSubject.next(false);
        }),
      )
      .subscribe({
        next: ({ user, funds, subscriptions, transactions }) => {
          this.userSubject.next(user);
          this.fundsSubject.next(this.sortFundsById(funds));
          this.subscriptionsSubject.next(
            this.sortSubscriptionsByDate(subscriptions),
          );
          this.transactionsSubject.next(
            this.sortTransactionsByDate(transactions),
          );
          this.hasLoaded = true;
        },
        error: () => {
          this.errorSubject.next(
            'No fue posible cargar la información. Verifica que el mock backend esté ejecutándose.',
          );
        },
      });
  }

  private sortFundsById(funds: Fund[]): Fund[] {
    return [...funds].sort((left, right) => left.id - right.id);
  }

  private sortSubscriptionsByDate(
    subscriptions: Subscription[],
  ): Subscription[] {
    return [...subscriptions].sort((left, right) => {
      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    });
  }

  private sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((left, right) => {
      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    });
  }
}