import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Employee } from '../../core/services/employee.service';
import { EmployeesComponent } from './employees.component';

describe('EmployeesComponent filters', () => {
  let component: EmployeesComponent;

  const employees: Employee[] = [
    {
      id: 1,
      employeeCode: 'EMP-001',
      firstName: 'Taylor',
      lastName: 'Jordan',
      email: 'taylor@example.com',
      country: 'Canada',
      department: 'Engineering',
      jobTitle: 'Developer',
      hireDate: '2026-01-10',
      active: true
    },
    {
      id: 2,
      employeeCode: 'EMP-002',
      firstName: 'Morgan',
      lastName: 'Lee',
      email: 'morgan@example.com',
      country: 'United States',
      department: 'Finance',
      jobTitle: 'Analyst',
      hireDate: '2025-08-15',
      active: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    component = TestBed.createComponent(EmployeesComponent).componentInstance;
    component.employees = employees;
  });

  it('filters employee code, country, and department case-insensitively', () => {
    component.filterForm.patchValue({
      employeeCode: 'emp-001',
      country: 'can',
      department: 'ENGINEER'
    });

    expect(component.filteredEmployees.map(employee => employee.id)).toEqual([1]);
  });

  it('filters by active and inactive status', () => {
    component.filterForm.controls.status.setValue('inactive');

    expect(component.filteredEmployees.map(employee => employee.id)).toEqual([2]);
  });

  it('combines text and status filters', () => {
    component.filterForm.patchValue({
      country: 'united',
      status: 'active'
    });

    expect(component.filteredEmployees).toEqual([]);
  });

  it('prepares Excel rows from filtered employees and excludes action controls', () => {
    component.filterForm.controls.status.setValue('active');

    expect(component.employeeExportRows).toEqual([{
      'Employee Code': 'EMP-001',
      Name: 'Taylor Jordan',
      Email: 'taylor@example.com',
      Country: 'Canada',
      Department: 'Engineering',
      'Job Title': 'Developer',
      'Base Salary': '',
      Currency: '',
      Status: 'Active'
    }]);
  });
});
