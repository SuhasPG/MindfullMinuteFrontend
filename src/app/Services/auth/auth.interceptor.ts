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

let isRefreshingToken = false; // Use a simple boolean
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); 

  
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
        
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function isAuthRequest(request: HttpRequest<any>): boolean {
  const url = request.url.toLowerCase();
  return url.includes('/login') || url.includes('/refresh-token'); 
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
    refreshTokenSubject.next(null); 

    return authService.refreshToken().pipe(
      switchMap((tokenResponse) => {
        
        refreshTokenSubject.next(tokenResponse.accessToken);

        
        return next(
          addTokenToRequest(originalRequest, tokenResponse.accessToken)
        );
      }),
      catchError((err) => {
        
        authService.logout();
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
        isRefreshingToken = false; 
      })
    );
  } else {
    
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((jwt) => {
        if (jwt) {
          return next(addTokenToRequest(originalRequest, jwt));
        }
        
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
