import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { PortfolioStoreService } from '../../funds/services/portfolio-store.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPageComponent implements OnInit {
  private readonly portfolioStoreService = inject(PortfolioStoreService);

  readonly vm$ = this.portfolioStoreService.portfolioViewModel$;

  ngOnInit(): void {
    this.portfolioStoreService.ensureLoaded();
  }

  reload(): void {
    this.portfolioStoreService.reload();
  }
}