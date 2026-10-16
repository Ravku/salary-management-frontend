import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { AnalyticsService, AnalyticsSummary, DepartmentAnalytics } from '../../core/services/analytics.service';

@Component({
  selector: 'app-department-analytics',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTableModule,
    PercentPipe,
    RouterLink
  ],
  templateUrl: './department-analytics.component.html'
})
export class DepartmentAnalyticsComponent implements OnInit {
  readonly colors = ['#3978f6', '#13a6a1', '#8863de', '#f49745', '#617f9c'];

  summary: AnalyticsSummary | null = null;
  departments: DepartmentAnalytics[] = [];
  errorMessage = '';
  isLoading = false;
  updatedAt: Date | null = null;

  constructor(private readonly analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.errorMessage = '';
    this.isLoading = true;

    forkJoin({
      summary: this.analyticsService.getSummary(),
      departments: this.analyticsService.getByDepartment()
    }).subscribe({
      next: ({ summary, departments }) => {
        this.summary = summary;
        this.departments = departments;
        this.updatedAt = new Date();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Department analytics could not be loaded. Check your connection and try again.';
        this.isLoading = false;
      }
    });
  }

  get currencies(): string[] {
    return [...new Set(this.departments.flatMap(department =>
      department.salaryStatistics.map(statistic => statistic.currency)
    ))];
  }

  get salaryColumns(): string[] {
    return ['department', ...this.currencies];
  }

  get salaryGroupCount(): number {
    return this.departments.reduce(
      (count, department) => count + department.salaryStatistics.length,
      0
    );
  }

  get maxEmployeeCount(): number {
    return Math.max(...this.departments.map(department => department.employeeCount), 1);
  }

  barWidth(employeeCount: number): number {
    return (employeeCount / this.maxEmployeeCount) * 100;
  }

  workforceShare(employeeCount: number): number {
    return this.summary?.totalEmployees
      ? employeeCount / this.summary.totalEmployees
      : 0;
  }

  colorFor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  currencyColor(currency: string): string {
    const index = this.currencies.indexOf(currency);
    return this.colorFor(index < 0 ? 0 : index);
  }

  averageSalary(department: DepartmentAnalytics, currency: string): number | null {
    return department.salaryStatistics.find(statistic => statistic.currency === currency)?.averageSalary ?? null;
  }

  formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(amount);
  }
}
