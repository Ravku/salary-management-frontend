import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmployeeSalary {
  id: number;
  baseSalary: number;
  currency: string;
  effectiveDate: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  active: boolean;
  salary?: EmployeeSalary | null;
}

export type EmployeePayload = Omit<Employee, 'id' | 'salary'>;

export interface EmployeePage {
  totalPages: number;
  totalElements: number;
  size: number;
  content: Employee[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly employeesUrl = `${environment.apiBaseUrl}/employees`;

  constructor(private readonly http: HttpClient) {}

  getEmployees(page: number, size: number): Observable<EmployeePage> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id');

    return this.http.get<EmployeePage>(this.employeesUrl, { params });
  }

  createEmployee(employee: EmployeePayload): Observable<Employee> {
    return this.http.post<Employee>(this.employeesUrl, employee);
  }

  updateEmployee(id: number, employee: EmployeePayload): Observable<Employee> {
    return this.http.put<Employee>(`${this.employeesUrl}/${id}`, employee);
  }
}
