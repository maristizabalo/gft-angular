import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import {
  BTG_FUNDS,
  DEFAULT_USER,
} from '../../../core/constants/business.constants';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  readonly user = DEFAULT_USER;
  readonly funds = BTG_FUNDS;
}