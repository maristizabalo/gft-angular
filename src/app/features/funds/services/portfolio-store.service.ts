import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, finalize, forkJoin, map } from 'rxjs';

import { Fund } from '../../../core/models/fund.model';
import { SubscribeToFundCommand } from '../../../core/models/portfolio-command.model';
import {
  PortfolioViewModel,
  UiFeedback,
} from '../../../core/models/portfolio-view.model';
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
  private readonly processingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly actionFeedbackSubject =
    new BehaviorSubject<UiFeedback | null>(null);

  private hasLoaded = false;
  private isLoading = false;

  readonly user$ = this.userSubject.asObservable();
  readonly funds$ = this.fundsSubject.asObservable();
  readonly subscriptions$ = this.subscriptionsSubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly processing$ = this.processingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly actionFeedback$ = this.actionFeedbackSubject.asObservable();

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
    processing: this.processing$,
    error: this.error$,
    actionFeedback: this.actionFeedback$,
  }).pipe(
    map(
      ({
        user,
        funds,
        activeSubscriptions,
        transactions,
        loading,
        processing,
        error,
        actionFeedback,
      }): PortfolioViewModel => ({
        user,
        fundCards: funds.map((fund) => {
          const activeSubscription = activeSubscriptions.find(
            (subscription) => subscription.fundId === fund.id,
          );

          return {
            ...fund,
            hasActiveSubscription: Boolean(activeSubscription),
            activeSubscriptionId: activeSubscription?.id ?? null,
            subscribedAmount: activeSubscription?.amount ?? null,
          };
        }),
        activeSubscriptions,
        transactions,
        loading,
        processing,
        error,
        actionFeedback,
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

  clearActionFeedback(): void {
    this.actionFeedbackSubject.next(null);
  }

  subscribeToFund(command: SubscribeToFundCommand): void {
    const user = this.userSubject.value;
    const fund = this.fundsSubject.value.find((item) => item.id === command.fundId);
    const activeSubscription = this.subscriptionsSubject.value.find(
      (item) => item.fundId === command.fundId && item.active,
    );

    if (!user || !fund) {
      this.setActionError('No fue posible identificar el usuario o el fondo seleccionado.');
      return;
    }

    if (activeSubscription) {
      this.setActionError('Ya existe una suscripción activa para este fondo.');
      return;
    }

    if (command.amount < fund.minimumAmount) {
      this.setActionError(
        `El monto mínimo para ${fund.name} es ${this.formatCurrency(fund.minimumAmount)}.`,
      );
      return;
    }

    if (user.balance < command.amount) {
      this.setActionError('No tienes saldo disponible para vincularte a este fondo.');
      return;
    }

    this.processingSubject.next(true);
    this.actionFeedbackSubject.next(null);

    const timestamp = new Date().toISOString();

    const updatedUser: User = {
      ...user,
      balance: user.balance - command.amount,
    };

    const newSubscription: Omit<Subscription, 'id'> = {
      fundId: fund.id,
      fundName: fund.name,
      amount: command.amount,
      notificationMethod: command.notificationMethod,
      createdAt: timestamp,
      active: true,
      cancelledAt: null,
    };

    const newTransaction: Omit<Transaction, 'id'> = {
      fundId: fund.id,
      fundName: fund.name,
      type: 'SUBSCRIPTION',
      amount: command.amount,
      status: 'SUCCESS',
      message: `Suscripción exitosa a ${fund.name}.`,
      createdAt: timestamp,
      previousBalance: user.balance,
      currentBalance: updatedUser.balance,
      notificationMethod: command.notificationMethod,
    };

    forkJoin({
      user: this.usersApiService.updateUser(updatedUser),
      subscription: this.subscriptionsApiService.createSubscription(newSubscription),
      transaction: this.transactionsApiService.createTransaction(newTransaction),
    })
      .pipe(
        finalize(() => {
          this.processingSubject.next(false);
        }),
      )
      .subscribe({
        next: ({ user: savedUser, subscription, transaction }) => {
          this.userSubject.next(savedUser);
          this.subscriptionsSubject.next(
            this.sortSubscriptionsByDate([
              ...this.subscriptionsSubject.value,
              subscription,
            ]),
          );
          this.transactionsSubject.next(
            this.sortTransactionsByDate([
              ...this.transactionsSubject.value,
              transaction,
            ]),
          );
          this.setActionSuccess(`Suscripción registrada en ${fund.name}.`);
        },
        error: () => {
          this.setActionError('No fue posible completar la operación.');
        },
      });
  }

  cancelSubscription(subscriptionId: string): void {
    const user = this.userSubject.value;
    const currentSubscription = this.subscriptionsSubject.value.find(
      (item) => item.id === subscriptionId && item.active,
    );

    if (!user || !currentSubscription) {
      this.setActionError('No fue posible encontrar la suscripción activa.');
      return;
    }

    this.processingSubject.next(true);
    this.actionFeedbackSubject.next(null);

    const timestamp = new Date().toISOString();

    const updatedUser: User = {
      ...user,
      balance: user.balance + currentSubscription.amount,
    };

    const updatedSubscription: Subscription = {
      ...currentSubscription,
      active: false,
      cancelledAt: timestamp,
    };

    const newTransaction: Omit<Transaction, 'id'> = {
      fundId: currentSubscription.fundId,
      fundName: currentSubscription.fundName,
      type: 'CANCELLATION',
      amount: currentSubscription.amount,
      status: 'SUCCESS',
      message: `Cancelación exitosa de ${currentSubscription.fundName}.`,
      createdAt: timestamp,
      previousBalance: user.balance,
      currentBalance: updatedUser.balance,
    };

    forkJoin({
      user: this.usersApiService.updateUser(updatedUser),
      subscription: this.subscriptionsApiService.updateSubscription(updatedSubscription),
      transaction: this.transactionsApiService.createTransaction(newTransaction),
    })
      .pipe(
        finalize(() => {
          this.processingSubject.next(false);
        }),
      )
      .subscribe({
        next: ({ user: savedUser, subscription, transaction }) => {
          this.userSubject.next(savedUser);
          this.subscriptionsSubject.next(
            this.sortSubscriptionsByDate(
              this.subscriptionsSubject.value.map((item) =>
                item.id === subscription.id ? subscription : item,
              ),
            ),
          );
          this.transactionsSubject.next(
            this.sortTransactionsByDate([
              ...this.transactionsSubject.value,
              transaction,
            ]),
          );
          this.setActionSuccess(
            `Participación cancelada en ${currentSubscription.fundName}.`,
          );
        },
        error: () => {
          this.setActionError('No fue posible completar la operación.');
        },
      });
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
    return [...funds].sort((left, right) => Number(left.id) - Number(right.id));
  }

  private sortSubscriptionsByDate(
    subscriptions: Subscription[],
  ): Subscription[] {
    return [...subscriptions].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  private sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  private setActionSuccess(message: string): void {
    this.actionFeedbackSubject.next({
      type: 'success',
      message,
    });
  }

  private setActionError(message: string): void {
    this.actionFeedbackSubject.next({
      type: 'error',
      message,
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}