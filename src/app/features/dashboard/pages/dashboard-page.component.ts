import { AsyncPipe, CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, startWith } from 'rxjs';

import { NOTIFICATION_METHOD_OPTIONS } from '../../../core/constants/business.constants';
import { NotificationMethod } from '../../../core/models/common.types';
import { FundCardViewModel } from '../../../core/models/portfolio-view.model';
import { PortfolioStoreService } from '../../funds/services/portfolio-store.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly portfolioStoreService = inject(PortfolioStoreService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly vm$ = this.portfolioStoreService.portfolioViewModel$;
  readonly notificationMethodOptions = NOTIFICATION_METHOD_OPTIONS;

  readonly subscriptionForm = this.formBuilder.nonNullable.group({
    fundId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    notificationMethod: ['email' as NotificationMethod, Validators.required],
  });

  selectedFund: FundCardViewModel | null = null;

  ngOnInit(): void {
    this.portfolioStoreService.ensureLoaded();

    combineLatest([
      this.vm$,
      this.subscriptionForm.controls.fundId.valueChanges.pipe(
        startWith(this.subscriptionForm.controls.fundId.value),
      ),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([vm, fundId]) => {
        this.selectedFund =
          vm.fundCards.find((fund) => fund.id === fundId) ?? null;

        if (!this.selectedFund) {
          this.subscriptionForm.controls.amount.setValidators([
            Validators.required,
            Validators.min(1),
          ]);

          this.subscriptionForm.controls.amount.updateValueAndValidity({
            emitEvent: false,
          });

          return;
        }

        const minimumAmount = this.selectedFund.minimumAmount;

        this.subscriptionForm.controls.amount.setValidators([
          Validators.required,
          Validators.min(minimumAmount),
        ]);

        this.subscriptionForm.controls.amount.updateValueAndValidity({
          emitEvent: false,
        });

        if (this.subscriptionForm.controls.amount.value < minimumAmount) {
          this.subscriptionForm.controls.amount.setValue(minimumAmount);
        }
      });
  }

  selectFund(fund: FundCardViewModel): void {
    this.portfolioStoreService.clearActionFeedback();
    this.subscriptionForm.patchValue({
      fundId: fund.id,
      amount: fund.minimumAmount,
    });
  }

  submitSubscription(): void {
    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      return;
    }

    const rawValue = this.subscriptionForm.getRawValue();

    this.portfolioStoreService.subscribeToFund({
      fundId: rawValue.fundId,
      amount: Number(rawValue.amount),
      notificationMethod: rawValue.notificationMethod,
    });
  }

  cancelSubscription(subscriptionId: string): void {
    this.portfolioStoreService.cancelSubscription(subscriptionId);
  }

  reload(): void {
    this.portfolioStoreService.reload();
  }

  dismissActionFeedback(): void {
    this.portfolioStoreService.clearActionFeedback();
  }
}