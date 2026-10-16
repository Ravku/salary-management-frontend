import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./feature/auth/login.component').then(module => module.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./feature/dashboard/dashboard.component').then(module => module.DashboardComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'country' },
      {
        path: 'country',
        loadComponent: () => import('./feature/dashboard/country-analytics.component')
          .then(module => module.CountryAnalyticsComponent)
      },
      {
        path: 'department',
        loadComponent: () => import('./feature/dashboard/department-analytics.component')
          .then(module => module.DepartmentAnalyticsComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./feature/employees/employees.component')
          .then(module => module.EmployeesComponent)
      }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
