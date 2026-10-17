import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DepartmentAnalyticsComponent } from './department-analytics.component';

describe('DepartmentAnalyticsComponent', () => {
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let fixture: ReturnType<typeof TestBed.createComponent<DepartmentAnalyticsComponent>>;
  let component: DepartmentAnalyticsComponent;

  const summary = {
    totalEmployees: 20,
    activeEmployees: 16,
    salaryStatistics: []
  };
  const departments = [
    {
      group: 'Engineering',
      employeeCount: 12,
      activeEmployees: 10,
      salaryStatistics: [
        { currency: 'USD', employeeCount: 8, averageSalary: 95000, totalSalary: 760000 },
        { currency: 'CAD', employeeCount: 4, averageSalary: 85000, totalSalary: 340000 }
      ]
    },
    {
      group: 'Finance',
      employeeCount: 8,
      activeEmployees: 6,
      salaryStatistics: [
        { currency: 'USD', employeeCount: 8, averageSalary: 78000, totalSalary: 624000 }
      ]
    }
  ];

  beforeEach(async () => {
    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['getSummary', 'getByDepartment']
    );
    analyticsService.getSummary.and.returnValue(of(summary));
    analyticsService.getByDepartment.and.returnValue(of(departments));

    await TestBed.configureTestingModule({
      imports: [DepartmentAnalyticsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AnalyticsService, useValue: analyticsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads department analytics and renders departments and currencies', () => {
    expect(analyticsService.getSummary).toHaveBeenCalledTimes(1);
    expect(analyticsService.getByDepartment).toHaveBeenCalledTimes(1);
    expect(component.summary).toEqual(summary);
    expect(component.departments).toEqual(departments);
    expect(component.isLoading).toBeFalse();
    expect(component.updatedAt).toEqual(jasmine.any(Date));

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Department analytics');
    expect(text).toContain('Engineering');
    expect(text).toContain('Finance');
    expect(text).toContain('CAD');
    expect(text).toContain('USD');
  });

  it('derives currency columns, salary groups, workforce shares, and salary values', () => {
    expect(component.currencies).toEqual(['USD', 'CAD']);
    expect(component.salaryColumns).toEqual(['department', 'USD', 'CAD']);
    expect(component.salaryGroupCount).toBe(3);
    expect(component.maxEmployeeCount).toBe(12);
    expect(component.barWidth(6)).toBe(50);
    expect(component.workforceShare(8)).toBe(0.4);
    expect(component.averageSalary(departments[0], 'CAD')).toBe(85000);
    expect(component.averageSalary(departments[1], 'CAD')).toBeNull();
    expect(component.formatMoney(95000.4)).toBe('95,000');
    expect(component.currencyColor('USD')).toBe(component.colors[0]);
  });

  it('shows an error when department analytics cannot be loaded', () => {
    analyticsService.getByDepartment.and.returnValue(throwError(() => new Error('failed')));

    component.loadAnalytics();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe(
      'Department analytics could not be loaded. Check your connection and try again.'
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('reloads analytics when the refresh button is clicked', () => {
    fixture.nativeElement.querySelector('.refresh-button').click();
    fixture.detectChanges();

    expect(analyticsService.getSummary).toHaveBeenCalledTimes(2);
    expect(analyticsService.getByDepartment).toHaveBeenCalledTimes(2);
  });
});
