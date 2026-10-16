import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const analyticsApiBaseUrl = 'http://localhost:8080/api/analytics/';
const employeesApiUrl = 'http://localhost:8080/api/employees';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isProtectedApiRequest = request.url.startsWith(analyticsApiBaseUrl)
    || request.url === employeesApiUrl
    || request.url.startsWith(`${employeesApiUrl}?`)
    || request.url.startsWith(`${employeesApiUrl}/`);

  if (!isProtectedApiRequest) {
    return next(request);
  }

  const token = inject(AuthService).getToken();
  return next(token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request);
};
