import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor() { }

  // start system
  start(authServce: any): Promise<boolean>  {
    return new Promise((resolve, reject) => {
      
      // TODO - check for user logged in
      authServce.isLoggedIn = true;

      resolve(true);
    })
  }
}
