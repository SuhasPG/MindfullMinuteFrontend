import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// For Angular 18's functional interceptors
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Static variables to track refresh state (shared across all requests)
  // Using a closure to maintain state between interceptions
  const isRefreshing = { value: false };
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);
  
  // Skip adding token for login and refresh token requests
  if (isAuthRequest(req)) {
    return next(req);
  }

  // Add auth header with JWT if available
  const token = authService.getAccessToken();
  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService, isRefreshing, refreshTokenSubject);
      }
      return throwError(() => error);
    })
  );
};

function isAuthRequest(request: HttpRequest<any>): boolean {
  // Determine if the request is a login or refresh token request
  const url = request.url.toLowerCase();
  return url.includes('/login') || url.includes('/refresh-token');
}

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn,
  authService: AuthService,
  isRefreshing: {value: boolean},
  refreshTokenSubject: BehaviorSubject<string | null>
): Observable<any> {
  // If we're not already refreshing
  if (!isRefreshing.value) {
    isRefreshing.value = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing.value = false;
        refreshTokenSubject.next(response.accessToken);
        
        // Retry the original request with new token
        return next(addToken(request, response.accessToken));
      }),
      catchError((error) => {
        isRefreshing.value = false;
        authService.logout();
        return throwError(() => error);
      }),
      finalize(() => {
        isRefreshing.value = false;
      })
    );
  } else {
    // Wait until refreshToken is completed, then retry with new token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        if (token) {
          return next(addToken(request, token));
        }
        return of();
      })
    );
  }
}