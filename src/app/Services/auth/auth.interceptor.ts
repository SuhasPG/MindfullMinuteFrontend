import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service'; // Ensure this path is correct

// --- STATE VARIABLES MOVED OUTSIDE ---
// These need to be module-scoped to be shared across all interceptor invocations
let isRefreshingToken = false; // Use a simple boolean
const refreshTokenSubject = new BehaviorSubject<string | null>(null);
// --- END OF STATE VARIABLES ---

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // inject AuthService inside the interceptor

  // Skip adding token for login and refresh token requests
  if (isAuthRequest(req)) {
    return next(req);
  }

  // Add auth header with JWT if available
  const token = authService.getAccessToken();
  if (token) {
    req = addTokenToRequest(req, token); // Renamed for clarity
  }

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Pass the shared state variables by relying on their module scope
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function isAuthRequest(request: HttpRequest<any>): boolean {
  const url = request.url.toLowerCase();
  return url.includes('/login') || url.includes('/refresh-token'); // Make sure your refresh endpoint is correctly identified
}

function addTokenToRequest(
  request: HttpRequest<any>,
  token: string
): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error(
  originalRequest: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<any> {
  if (!isRefreshingToken) {
    isRefreshingToken = true;
    refreshTokenSubject.next(null); // Signal that a refresh is in progress

    return authService.refreshToken().pipe(
      switchMap((tokenResponse) => {
        // Assuming refreshToken() returns Observable<{accessToken: string, ...}>
        // isRefreshingToken = false; // Moved to finalize
        refreshTokenSubject.next(tokenResponse.accessToken);

        // IMPORTANT: AuthService.refreshToken() MUST save the new tokens
        // authService.saveTokens(tokenResponse.accessToken, tokenResponse.refreshToken); // Or similar

        return next(
          addTokenToRequest(originalRequest, tokenResponse.accessToken)
        );
      }),
      catchError((err) => {
        // isRefreshingToken = false; // Moved to finalize
        authService.logout(); // If refresh fails, logout the user
        return throwError(
          () =>
            new HttpErrorResponse({
              error: 'Refresh token failed',
              status: 401,
              url: originalRequest.url,
            })
        );
      }),
      finalize(() => {
        isRefreshingToken = false; // Reset refreshing status whether success or error
      })
    );
  } else {
    // If isRefreshingToken is true, means another request is already refreshing the token.
    // Wait for refreshTokenSubject to emit a new token (not the initial null).
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((jwt) => {
        if (jwt) {
          return next(addTokenToRequest(originalRequest, jwt));
        }
        // This case should ideally not be hit if logout happens on refresh failure,
        // but as a fallback:
        authService.logout();
        return throwError(
          () =>
            new HttpErrorResponse({
              error: 'Failed to get new token after refresh',
              status: 401,
              url: originalRequest.url,
            })
        );
      })
    );
  }
}
