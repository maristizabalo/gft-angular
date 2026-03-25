import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Fund } from '../../../core/models/fund.model';
import { PortfolioViewModel } from '../../../core/models/portfolio-view.model';
import { Subscription } from '../../../core/models/subscription.model';
import { Transaction } from '../../../core/models/transaction.model';
import { User } from '../../../core/models/user.model';
import { FundsApiService } from '../../../core/services/funds-api.service';
import { SubscriptionsApiService } from '../../../core/services/subscriptions-api.service';
import { TransactionsApiService } from '../../../core/services/transactions-api.service';
import { UsersApiService } from '../../../core/services/users-api.service';
import { PortfolioStoreService } from './portfolio-store.service';

describe('PortfolioStoreService', () => {
  let service: PortfolioStoreService;

  const usersApiServiceMock = {
    getUser: vi.fn(),
    updateUser: vi.fn(),
  };

  const fundsApiServiceMock = {
    getFunds: vi.fn(),
  };

  const subscriptionsApiServiceMock = {
    getSubscriptions: vi.fn(),
    createSubscription: vi.fn(),
    updateSubscription: vi.fn(),
  };

  const transactionsApiServiceMock = {
    getTransactions: vi.fn(),
    createTransaction: vi.fn(),
  };

  const baseUser: User = {
    id: '1',
    fullName: 'Maicol Aristizabal',
    email: 'maicol.aristizabal@btgpactual.com',
    phone: '+573001112233',
    balance: 500000,
  };

  const funds: Fund[] = [
    {
      id: '1',
      name: 'FPV_BTG_PACTUAL_RECAUDADORA',
      minimumAmount: 75000,
      category: 'FPV',
    },
    {
      id: '2',
      name: 'DEUDAPRIVADA',
      minimumAmount: 50000,
      category: 'FIC',
    },
  ];

  function captureLatestVm() {
    let latestVm: PortfolioViewModel | undefined;

    const subscription = service.portfolioViewModel$.subscribe((vm) => {
      latestVm = vm;
    });

    return {
      subscription,
      get value() {
        return latestVm;
      },
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();

    usersApiServiceMock.getUser.mockReturnValue(of(baseUser));
    usersApiServiceMock.updateUser.mockReturnValue(of(baseUser));
    fundsApiServiceMock.getFunds.mockReturnValue(of(funds));
    subscriptionsApiServiceMock.getSubscriptions.mockReturnValue(of([]));
    subscriptionsApiServiceMock.createSubscription.mockReturnValue(
      of({
        id: '101',
        fundId: '1',
        fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
        amount: 75000,
        notificationMethod: 'email',
        createdAt: '2026-03-25T10:00:00.000Z',
        active: true,
        cancelledAt: null,
      }),
    );
    subscriptionsApiServiceMock.updateSubscription.mockReturnValue(
      of({
        id: '101',
        fundId: '1',
        fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
        amount: 75000,
        notificationMethod: 'email',
        createdAt: '2026-03-25T10:00:00.000Z',
        active: false,
        cancelledAt: '2026-03-25T11:00:00.000Z',
      }),
    );
    transactionsApiServiceMock.getTransactions.mockReturnValue(of([]));
    transactionsApiServiceMock.createTransaction.mockReturnValue(
      of({
        id: '201',
        fundId: '1',
        fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
        type: 'SUBSCRIPTION',
        amount: 75000,
        status: 'SUCCESS',
        message: 'Suscripción exitosa a FPV_BTG_PACTUAL_RECAUDADORA.',
        createdAt: '2026-03-25T10:00:00.000Z',
        previousBalance: 500000,
        currentBalance: 425000,
        notificationMethod: 'email',
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        PortfolioStoreService,
        {
          provide: UsersApiService,
          useValue: usersApiServiceMock,
        },
        {
          provide: FundsApiService,
          useValue: fundsApiServiceMock,
        },
        {
          provide: SubscriptionsApiService,
          useValue: subscriptionsApiServiceMock,
        },
        {
          provide: TransactionsApiService,
          useValue: transactionsApiServiceMock,
        },
      ],
    });

    service = TestBed.inject(PortfolioStoreService);
  });

  it('debe cargar el estado inicial del portafolio', () => {
    const state = captureLatestVm();

    service.ensureLoaded();

    expect(usersApiServiceMock.getUser).toHaveBeenCalledTimes(1);
    expect(fundsApiServiceMock.getFunds).toHaveBeenCalledTimes(1);
    expect(state.value?.user?.fullName).toBe('Maicol Aristizabal');
    expect(state.value?.user?.balance).toBe(500000);
    expect(state.value?.fundCards.length).toBe(2);
    expect(state.value?.activeSubscriptions.length).toBe(0);
    expect(state.value?.transactions.length).toBe(0);
    expect(state.value?.error).toBeNull();

    state.subscription.unsubscribe();
  });

  it('debe registrar una suscripción y descontar el saldo', () => {
    const state = captureLatestVm();

    service.ensureLoaded();

    const updatedUser: User = {
      ...baseUser,
      balance: 425000,
    };

    const savedSubscription: Subscription = {
      id: '101',
      fundId: '1',
      fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
      amount: 75000,
      notificationMethod: 'email',
      createdAt: '2026-03-25T10:00:00.000Z',
      active: true,
      cancelledAt: null,
    };

    const savedTransaction: Transaction = {
      id: '201',
      fundId: '1',
      fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
      type: 'SUBSCRIPTION',
      amount: 75000,
      status: 'SUCCESS',
      message: 'Suscripción exitosa a FPV_BTG_PACTUAL_RECAUDADORA.',
      createdAt: '2026-03-25T10:00:00.000Z',
      previousBalance: 500000,
      currentBalance: 425000,
      notificationMethod: 'email',
    };

    usersApiServiceMock.updateUser.mockReturnValue(of(updatedUser));
    subscriptionsApiServiceMock.createSubscription.mockReturnValue(
      of(savedSubscription),
    );
    transactionsApiServiceMock.createTransaction.mockReturnValue(
      of(savedTransaction),
    );

    service.subscribeToFund({
      fundId: '1',
      amount: 75000,
      notificationMethod: 'email',
    });

    expect(usersApiServiceMock.updateUser).toHaveBeenCalledWith(updatedUser);
    expect(subscriptionsApiServiceMock.createSubscription).toHaveBeenCalled();
    expect(transactionsApiServiceMock.createTransaction).toHaveBeenCalled();
    expect(state.value?.user?.balance).toBe(425000);
    expect(state.value?.activeSubscriptions.length).toBe(1);
    expect(state.value?.transactions.length).toBe(1);
    expect(state.value?.actionFeedback?.type).toBe('success');

    state.subscription.unsubscribe();
  });

  it('no debe permitir una suscripción si el monto supera el saldo', () => {
    const state = captureLatestVm();

    service.ensureLoaded();
    service.subscribeToFund({
      fundId: '1',
      amount: 900000,
      notificationMethod: 'sms',
    });

    expect(usersApiServiceMock.updateUser).not.toHaveBeenCalled();
    expect(subscriptionsApiServiceMock.createSubscription).not.toHaveBeenCalled();
    expect(transactionsApiServiceMock.createTransaction).not.toHaveBeenCalled();
    expect(state.value?.user?.balance).toBe(500000);
    expect(state.value?.activeSubscriptions.length).toBe(0);
    expect(state.value?.actionFeedback?.type).toBe('error');
    expect(state.value?.actionFeedback?.message).toContain('saldo disponible');

    state.subscription.unsubscribe();
  });

  it('debe cancelar una suscripción activa y devolver el saldo', () => {
    const activeUser: User = {
      ...baseUser,
      balance: 425000,
    };

    const activeSubscription: Subscription = {
      id: '101',
      fundId: '1',
      fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
      amount: 75000,
      notificationMethod: 'email',
      createdAt: '2026-03-25T10:00:00.000Z',
      active: true,
      cancelledAt: null,
    };

    usersApiServiceMock.getUser.mockReturnValue(of(activeUser));
    subscriptionsApiServiceMock.getSubscriptions.mockReturnValue(
      of([activeSubscription]),
    );

    const state = captureLatestVm();

    service.ensureLoaded();

    const restoredUser: User = {
      ...activeUser,
      balance: 500000,
    };

    const cancelledSubscription: Subscription = {
      ...activeSubscription,
      active: false,
      cancelledAt: '2026-03-25T11:00:00.000Z',
    };

    const cancellationTransaction: Transaction = {
      id: '301',
      fundId: '1',
      fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
      type: 'CANCELLATION',
      amount: 75000,
      status: 'SUCCESS',
      message: 'Cancelación exitosa de FPV_BTG_PACTUAL_RECAUDADORA.',
      createdAt: '2026-03-25T11:00:00.000Z',
      previousBalance: 425000,
      currentBalance: 500000,
    };

    usersApiServiceMock.updateUser.mockReturnValue(of(restoredUser));
    subscriptionsApiServiceMock.updateSubscription.mockReturnValue(
      of(cancelledSubscription),
    );
    transactionsApiServiceMock.createTransaction.mockReturnValue(
      of(cancellationTransaction),
    );

    service.cancelSubscription('101');

    expect(usersApiServiceMock.updateUser).toHaveBeenCalledWith(restoredUser);
    expect(subscriptionsApiServiceMock.updateSubscription).toHaveBeenCalled();
    expect(transactionsApiServiceMock.createTransaction).toHaveBeenCalled();
    expect(state.value?.user?.balance).toBe(500000);
    expect(state.value?.activeSubscriptions.length).toBe(0);
    expect(state.value?.transactions[0].type).toBe('CANCELLATION');
    expect(state.value?.actionFeedback?.type).toBe('success');

    state.subscription.unsubscribe();
  });
});