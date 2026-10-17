import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { EmployeePayload, EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpTestingController: HttpTestingController;

  const employee: EmployeePayload = {
    employeeCode: 'EMP-1',
    firstName: 'Taylor',
    lastName: 'Jordan',
    email: 'taylor@example.com',
    country: 'Canada',
    department: 'Engineering',
    jobTitle: 'Developer',
    hireDate: '2026-10-16',
    active: true
  };

  beforeEach(() => {
    localStorage.setItem('salary-management-auth-token', 'employee-test-token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EmployeeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('gets a page of employees with the requested pagination and bearer token', () => {
    service.getEmployees(0, 10).subscribe();

    const request = httpTestingController.expectOne(
      request => request.url === 'http://localhost:8080/api/employees'
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('10');
    expect(request.request.params.get('sort')).toBe('["desc"]');
    expect(request.request.headers.get('Authorization')).toBe('Bearer employee-test-token');
    request.flush({
      totalPages: 0,
      totalElements: 0,
      size: 10,
      content: [],
      number: 0,
      numberOfElements: 0,
      first: true,
      last: true,
      empty: true
    });
  });

  it('posts the employee payload to create an employee', () => {
    service.createEmployee(employee).subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/employees');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(employee);
    expect(request.request.headers.get('Authorization')).toBe('Bearer employee-test-token');
    request.flush({ id: 1, ...employee });
  });

  it('puts employee changes to the employee resource', () => {
    service.updateEmployee(42, employee).subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/employees/42');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(employee);
    expect(request.request.headers.get('Authorization')).toBe('Bearer employee-test-token');
    request.flush({ id: 42, ...employee });
  });
});
