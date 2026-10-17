import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { Employee, EmployeePage, EmployeePayload, EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    ReactiveFormsModule
  ],
  templateUrl: './employees.component.html'
})
export class EmployeesComponent implements OnInit {
  readonly displayedColumns = [
    'employeeCode',
    'name',
    'email',
    'country',
    'department',
    'jobTitle',
    'active',
    'actions'
  ];

  readonly employeeForm = this.formBuilder.nonNullable.group({
    employeeCode: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    country: ['', Validators.required],
    department: ['', Validators.required],
    jobTitle: ['', Validators.required],
    hireDate: ['', Validators.required],
    active: [true]
  });

  employees: Employee[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  formErrorMessage = '';
  formVisible = false;
  editingEmployeeId: number | null = null;
  selectedEmployee: Employee | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(pageIndex = this.pageIndex, pageSize = this.pageSize): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.getEmployees(pageIndex, pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (page: EmployeePage) => {
          this.employees = page.content;
          this.totalElements = page.totalElements;
          this.pageIndex = page.number;
          this.pageSize = page.size || pageSize;
        },
        error: () => {
          this.errorMessage = 'Employees could not be loaded. Check your connection and try again.';
        }
      });
  }

  changePage(event: PageEvent): void {
    this.loadEmployees(event.pageIndex, event.pageSize);
  }

  showCreateForm(): void {
    this.editingEmployeeId = null;
    this.selectedEmployee = null;
    this.formErrorMessage = '';
    this.employeeForm.reset({
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      country: '',
      department: '',
      jobTitle: '',
      hireDate: this.localToday(),
      active: true
    });
    this.formVisible = true;
  }

  editEmployee(employee: Employee): void {
    this.selectedEmployee = null;
    this.editingEmployeeId = employee.id;
    this.formErrorMessage = '';
    this.employeeForm.reset({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      country: employee.country,
      department: employee.department,
      jobTitle: employee.jobTitle,
      hireDate: employee.hireDate,
      active: employee.active
    });
    this.formVisible = true;
  }

  viewEmployee(employee: Employee): void {
    this.formVisible = false;
    this.selectedEmployee = employee;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingEmployeeId = null;
    this.formErrorMessage = '';
  }

  saveEmployee(): void {
    this.formErrorMessage = '';
    this.successMessage = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employee: EmployeePayload = this.employeeForm.getRawValue();
    const request = this.editingEmployeeId === null
      ? this.employeeService.createEmployee(employee)
      : this.employeeService.updateEmployee(this.editingEmployeeId, employee);

    this.isSaving = true;
    request.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: () => {
        const wasCreating = this.editingEmployeeId === null;
        this.closeForm();
        this.successMessage = wasCreating ? 'Employee created successfully.' : 'Employee updated successfully.';
        this.loadEmployees(wasCreating ? 0 : this.pageIndex, this.pageSize);
      },
      error: () => {
        this.formErrorMessage = 'Employee could not be saved. Check the details and try again.';
      }
    });
  }

  fullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }

  trackEmployee(_index: number, employee: Employee): number {
    return employee.id;
  }

  private localToday(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
}
