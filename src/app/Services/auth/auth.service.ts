import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://localhost:7026';
  private tokenExpiryTime: number | null = null;
  private refreshTokenTimeout: any;
  
  // Use BehaviorSubject to track authentication state throughout the app
  private currentUserSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Start the token refresh process if user is logged in
    if (this.isLoggedIn()) {
      this.startRefreshTokenTimer();
    }
  }

  // login(email: string, password: string): Observable<AuthResponse> {
  //   return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password })
  //     .pipe(
  //       tap(response => this.setSession(response)),
  //       catchError(error => {
  //         console.error('Login failed:', error);
  //         return throwError(() => new Error('Invalid email or password'));
  //       })
  //     );
  // }

  logout(): void {
    // Remove tokens from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    
    // Clear the refresh token timer
    this.stopRefreshTokenTimer();
    
    // Update authentication state
    this.currentUserSubject.next(false);
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return new Observable<AuthResponse>(observer => {
      this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password })
        .subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            this.setSession(response);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Login failed:', error);
            observer.error(new Error('Invalid email or password'));
          }
        });
    });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return new Observable<AuthResponse>(observer => {
        observer.error(new Error('No refresh token available'));
      });
    }

    return new Observable<AuthResponse>(observer => {
      this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
        .subscribe({
          next: (response) => {
            this.setSession(response);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Token refresh failed:', error);
            this.logout();
            observer.error(new Error('Session expired. Please login again.'));
          }
        });
    });
  }

  isLoggedIn(): boolean {
    // Check if the current time is before the token expiration
    const expiresAt = localStorage.getItem('expires_at');
    return expiresAt ? Date.now() < parseInt(expiresAt, 10) : false;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setSession(authResult: AuthResponse): void {
    
    const expiresAt = Date.now() + authResult.expiresIn * 1000;
    console.log('Token expires at:', new Date(expiresAt));
    this.tokenExpiryTime = expiresAt;
    
    
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('refresh_token', authResult.refreshToken);
    localStorage.setItem('expires_at', expiresAt.toString());
    
    
    this.currentUserSubject.next(true);
    
    
    this.startRefreshTokenTimer();
  }


  private startRefreshTokenTimer(): void {
    // Clear any existing timer
    this.stopRefreshTokenTimer();
    
    // Get token expiry time
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) return;
    
    const expires = parseInt(expiresAt, 10);
    this.tokenExpiryTime = expires;
    
    // Set timeout to refresh token before it expires
    // Refresh 30 seconds before expiry
    const timeout = expires - Date.now() - (30 * 1000);
    
    // Only set refresh timer if expiry is in the future
    if (timeout > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe();
      }, timeout);
    } else {
      // Token already expired, attempt to refresh now
      this.refreshToken().subscribe();
    }
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
  
  // Get expiry time as Date object for debugging
  getTokenExpiryTime(): Date | null {
    return this.tokenExpiryTime ? new Date(this.tokenExpiryTime) : null;
  }

  // Get remaining time in seconds before token expires
  getTokenRemainingTime(): number {
    if (!this.tokenExpiryTime) return 0;
    const remaining = this.tokenExpiryTime - Date.now();
    return remaining > 0 ? Math.floor(remaining / 1000) : 0;
  }
}