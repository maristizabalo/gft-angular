import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./features/history/pages/history-page.component').then(
        (m) => m.HistoryPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];