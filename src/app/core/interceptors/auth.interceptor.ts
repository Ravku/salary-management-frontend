import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

const analyticsApiUrl = `${environment.apiBaseUrl}/analytics/`;
const employeesApiUrl = `${environment.apiBaseUrl}/employees`;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isProtectedApiRequest = request.url.startsWith(analyticsApiUrl)
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
