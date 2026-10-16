import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const analyticsApiBaseUrl = 'http://localhost:8080/api/analytics/';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(analyticsApiBaseUrl)) {
    return next(request);
  }

  const token = inject(AuthService).getToken();
  return next(token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request);
};
