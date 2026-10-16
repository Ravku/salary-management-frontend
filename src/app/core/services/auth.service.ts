import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token?: unknown;
  accessToken?: unknown;
  access_token?: unknown;
  jwt?: unknown;
  data?: LoginResponse;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = 'http://localhost:8080/api/auth/login';
  private readonly tokenStorageKey = 'salary-management-auth-token';

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<void> {
    return this.http.post<unknown>(this.loginUrl, credentials).pipe(
      map(response => {
        const token = this.extractToken(response);
        if (!token) {
          throw new Error('The sign-in response did not include an access token.');
        }

        localStorage.setItem(this.tokenStorageKey, token);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }

  private extractToken(response: unknown): string | null {
    if (typeof response === 'string' && response.trim()) {
      return response.trim();
    }

    if (typeof response !== 'object' || response === null) {
      return null;
    }

    const body = response as LoginResponse;
    for (const value of [body.token, body.accessToken, body.access_token, body.jwt]) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return body.data ? this.extractToken(body.data) : null;
  }
}
