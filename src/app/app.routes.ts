import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/layout').then(m => m.Layout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./features/transactions/add-transaction/add-transaction')
            .then(m => m.AddTransaction)
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-list/transaction-list')
            .then(m => m.TransactionList)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports/reports')
            .then(m => m.Reports)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];