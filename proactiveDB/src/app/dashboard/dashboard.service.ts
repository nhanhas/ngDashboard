import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { ChartConfigItem } from '../core/models/ChartConfigItem';
import { DashboardItem } from '../core/models/DashboardItem';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // widgets in edition
  chart$ = new BehaviorSubject<ChartConfigItem>(null);
  snapshot$ = new BehaviorSubject<any>(null); // TODO - class snapshotconfig
  visual$ = new BehaviorSubject<any>(null); // TODO - class visualconfig

  dashboardTab$ = new BehaviorSubject<DashboardItem>(null);

  constructor(
    private apiService: ApiService) { }

  // clear edition toolbox
  clearWidgetsEdition() {
    this.chart$.next(undefined);
    this.visual$.next(undefined);
  }


  // server requests

  // load available dashboards
  loadDashboards(): Observable<any> {
    const url: string = '/ChartSet/GetDashBoards';

    return this.apiService.GET(url);
  }

  // load charts by dashboard
  loadChartByDashboard(id: number): Observable<any>{
    const url: string = `/chartConfig/GetDashBoardItens?DashBoardId=${id}`;

    return this.apiService.GET(url);
  }

  // charts
  createChart(chart: ChartConfigItem): Observable<any> {
    const url: string = '/ChartConfig/Create';

    return this.apiService.POST(url, chart);        
  }

  updateChart(chart: ChartConfigItem): Observable<any> {
    const url: string = '/ChartConfig/Update';

    return this.apiService.POST(url, chart);        
  }

  loadChartResults(id: number, startDate: Date, endDate: Date): Observable<any>{
    const url: string = '/DataEntries/GetDataEntriesByObjectId';

    return this.apiService.POST(url, {
      ChartId: id,
      StartingDate: startDate,
      EndingDate: endDate        
    });        
    
  }

}
