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

  // load available dashboards
  loadDashboards(): Observable<any> {
    const url: string = this.apiEndpoint + '/ChartSet/GetDashBoards';

    return this.http.get(url);
  }

  loadChartByDashboard(id: number): Observable<any>{
    const url: string = this.apiEndpoint + `/chartConfig/GetDashBoardItens?DashBoardId=${id}`;

    return this.http.get(url);
  }

}
