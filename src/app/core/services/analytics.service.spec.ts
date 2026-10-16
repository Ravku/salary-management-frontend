import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('salary-management-auth-token', 'test-token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AnalyticsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('gets the summary with only the bearer authorization header', () => {
    service.getSummary().subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analytics/summary');
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({ totalEmployees: 1, activeEmployees: 1, salaryStatistics: [] });
  });

  it('gets country analytics with only the bearer authorization header', () => {
    service.getByCountry().subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analytics/by-country');
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush([]);
  });
});
