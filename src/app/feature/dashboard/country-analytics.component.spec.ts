import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CountryAnalyticsComponent } from './country-analytics.component';

describe('CountryAnalyticsComponent', () => {
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let fixture: ReturnType<typeof TestBed.createComponent<CountryAnalyticsComponent>>;
  let component: CountryAnalyticsComponent;

  const summary = {
    totalEmployees: 12,
    activeEmployees: 9,
    salaryStatistics: []
  };
  const countries = [
    {
      group: 'Canada',
      employeeCount: 8,
      activeEmployees: 6,
      salaryStatistics: [
        { currency: 'CAD', employeeCount: 8, averageSalary: 70000, totalSalary: 560000 }
      ]
    },
    {
      group: 'United States',
      employeeCount: 4,
      activeEmployees: 3,
      salaryStatistics: [
        { currency: 'USD', employeeCount: 4, averageSalary: 80000, totalSalary: 320000 }
      ]
    }
  ];

  beforeEach(async () => {
    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['getSummary', 'getByCountry']
    );
    analyticsService.getSummary.and.returnValue(of(summary));
    analyticsService.getByCountry.and.returnValue(of(countries));

    await TestBed.configureTestingModule({
      imports: [CountryAnalyticsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AnalyticsService, useValue: analyticsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CountryAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads summary and country data and renders the country analytics', () => {
    expect(analyticsService.getSummary).toHaveBeenCalledTimes(1);
    expect(analyticsService.getByCountry).toHaveBeenCalledTimes(1);
    expect(component.summary).toEqual(summary);
    expect(component.countries).toEqual(countries);
    expect(component.isLoading).toBeFalse();
    expect(component.updatedAt).toEqual(jasmine.any(Date));

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Country analytics');
    expect(text).toContain('Canada');
    expect(text).toContain('United States');
    expect(text).toContain('12');
  });

  it('derives currency count, bar widths, and salary values', () => {
    expect(component.currencyCount).toBe(2);
    expect(component.maxEmployeeCount).toBe(8);
    expect(component.barWidth(4)).toBe(50);
    expect(component.averageSalary(countries[0])).toBe(70000);
    expect(component.currency(countries[0])).toBe('CAD');
    expect(component.totalSalary(countries[1])).toBe(320000);
    expect(component.formatMoney(1234.5)).toBe('1,234.50');
    expect(component.formatMillions(560000)).toBe('0.6M');
    expect(component.colorFor(5)).toBe(component.colors[0]);
  });

  it('shows an error when either analytics request fails', () => {
    analyticsService.getSummary.and.returnValue(throwError(() => new Error('failed')));

    component.loadAnalytics();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Analytics could not be loaded. Check your connection and try again.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('reloads analytics when the refresh button is clicked', () => {
    fixture.nativeElement.querySelector('.refresh-button').click();
    fixture.detectChanges();

    expect(analyticsService.getSummary).toHaveBeenCalledTimes(2);
    expect(analyticsService.getByCountry).toHaveBeenCalledTimes(2);
  });
});
