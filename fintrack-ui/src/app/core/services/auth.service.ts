import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';
import { environment } from '../../../environments/environment';

// Angular signals (v17+) are the modern reactive state primitive —
// think of them like RxJS BehaviorSubject but simpler for local state.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // Signal holds the current user — components read it reactively
  currentUser = signal<AuthResponse | null>(this.loadFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  register(request: RegisterRequest) {
    return this.http.post<{ data: AuthResponse }>(`${this.baseUrl}/register`, request).pipe(
      tap(res => this.setSession(res.data))
    );
  }

  login(request: LoginRequest) {
    return this.http.post<{ data: AuthResponse }>(`${this.baseUrl}/login`, request).pipe(
      tap(res => this.setSession(res.data))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setSession(auth: AuthResponse) {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth));
    this.currentUser.set(auth);
  }

  private loadFromStorage(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
