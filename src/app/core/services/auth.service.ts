import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = 'http://localhost:8080/api/auth/login';

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<unknown> {
    return this.http.post<unknown>(this.loginUrl, credentials);
  }
}
