import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  readonly apiEndpoint = 'https://10.1.0.25/api'

  constructor(
    private http: HttpClient) { }


    GET(endpoint: string): Observable<any> {
      const url = this.apiEndpoint + endpoint;

      return this.http.get(url);
    }

    POST(endpoint: string, params: any = {}) {
      const url = this.apiEndpoint + endpoint;

      return this.http.post(url, params);
    }

}
