import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('posts username and password to the login endpoint', () => {
    const credentials = { username: 'employee', password: 'secret' };
    let response: unknown;

    authService.login(credentials).subscribe(result => response = result);

    const request = httpTestingController.expectOne('http://localhost:8080/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);

    request.flush({ accessToken: 'test-bearer-token' });
    expect(response).toBeUndefined();
    expect(authService.getToken()).toBe('test-bearer-token');
  });

  it('rejects login responses that do not contain a bearer token', () => {
    let error: unknown;

    authService.login({ username: 'employee', password: 'secret' }).subscribe({
      error: result => error = result
    });

    httpTestingController.expectOne('http://localhost:8080/api/auth/login').flush({ authenticated: true });
    expect(error).toEqual(jasmine.any(Error));
    expect(authService.getToken()).toBeNull();
  });
});
