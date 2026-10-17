import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SalaryStatistic {
  currency: string;
  employeeCount: number;
  averageSalary: number;
  totalSalary: number;
}

export interface AnalyticsSummary {
  totalEmployees: number;
  activeEmployees: number;
  salaryStatistics: SalaryStatistic[];
}

export interface CountryAnalytics {
  group: string;
  employeeCount: number;
  activeEmployees: number;
  salaryStatistics: SalaryStatistic[];
}

export interface DepartmentAnalytics {
  group: string;
  employeeCount: number;
  activeEmployees: number;
  salaryStatistics: SalaryStatistic[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly apiBaseUrl = `${environment.apiBaseUrl}/analytics`;

  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.apiBaseUrl}/summary`);
  }

  getByCountry(): Observable<CountryAnalytics[]> {
    return this.http.get<CountryAnalytics[]>(`${this.apiBaseUrl}/by-country`);
  }

  getByDepartment(): Observable<DepartmentAnalytics[]> {
    return this.http.get<DepartmentAnalytics[]>(`${this.apiBaseUrl}/by-department`);
  }
}
