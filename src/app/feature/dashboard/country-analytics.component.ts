import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { AnalyticsService, AnalyticsSummary, CountryAnalytics } from '../../core/services/analytics.service';

@Component({
  selector: 'app-country-analytics',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTableModule,
    PercentPipe
  ],
  templateUrl: './country-analytics.component.html'
})
export class CountryAnalyticsComponent implements OnInit {
  readonly colors = ['#3978f6', '#13a6a1', '#8863de', '#f49745', '#617f9c'];
  readonly salaryColumns = ['country', 'averageSalary', 'totalSalary'];

  summary: AnalyticsSummary | null = null;
  countries: CountryAnalytics[] = [];
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
      countries: this.analyticsService.getByCountry()
    }).subscribe({
      next: ({ summary, countries }) => {
        this.summary = summary;
        this.countries = countries;
        this.updatedAt = new Date();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Analytics could not be loaded. Check your connection and try again.';
        this.isLoading = false;
      }
    });
  }

  get maxEmployeeCount(): number {
    return Math.max(...this.countries.map(country => country.employeeCount), 1);
  }

  get currencyCount(): number {
    return new Set(this.countries.flatMap(country =>
      country.salaryStatistics.map(statistic => statistic.currency)
    )).size;
  }

  barWidth(employeeCount: number): number {
    return (employeeCount / this.maxEmployeeCount) * 100;
  }

  colorFor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  averageSalary(country: CountryAnalytics): number {
    return country.salaryStatistics[0]?.averageSalary ?? 0;
  }

  currency(country: CountryAnalytics): string {
    return country.salaryStatistics[0]?.currency ?? '';
  }

  totalSalary(country: CountryAnalytics): number {
    return country.salaryStatistics[0]?.totalSalary ?? 0;
  }

  formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatMillions(amount: number): string {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
}
