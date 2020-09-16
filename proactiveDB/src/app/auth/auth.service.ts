import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;

  // user info => should a class
  user$ = new BehaviorSubject<{ id: string, name: string }>({id: '1', name: 'Miguel'});

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  constructor() { }
  

  login(): Observable<boolean> {
    return of(true)
    .pipe(
      delay(1000),
      tap(val => this.user$.next({id: '1', name: 'should update with something'})),
      tap(val => this.isLoggedIn = true)
    );
  }

  logout(): void {
    this.isLoggedIn = false;
  }
}
