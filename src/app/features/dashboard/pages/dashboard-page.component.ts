import { AsyncPipe, CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { PortfolioStoreService } from '../../funds/services/portfolio-store.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly portfolioStoreService = inject(PortfolioStoreService);

  readonly vm$ = this.portfolioStoreService.portfolioViewModel$;

  ngOnInit(): void {
    this.portfolioStoreService.ensureLoaded();
  }

  reload(): void {
    this.portfolioStoreService.reload();
  }
}