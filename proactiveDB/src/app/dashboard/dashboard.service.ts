import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { ChartConfigItem } from '../core/models/ChartConfigItem';
import { DashboardItem } from '../core/models/DashboardItem';
import { SnapshotConfigItem } from '../core/models/SnapshotConfigItem';
import { VisualConfigItem } from '../core/models/VisualConfigItem';
import { DashboardSetting } from '../shared/toolbox/filter-toolbox/filter-toolbox.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // widgets in edition
  chart$ = new BehaviorSubject<ChartConfigItem>(null);
  snapshot$ = new BehaviorSubject<SnapshotConfigItem>(null); 
  visual$ = new BehaviorSubject<VisualConfigItem>(null); 

  reloadData$ = new Subject<number>();

  dashboardTab$ = new BehaviorSubject<DashboardItem>(null);

  dateFiltersChanged$ = new Subject<void>();

  constructor(
    private apiService: ApiService) { }

  // clear edition toolbox
  clearWidgetsEdition() {
    this.chart$.next(undefined);
    this.visual$.next(undefined);
    this.snapshot$.next(undefined);
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

  // dashboard
  createDashboard(dashboard: DashboardItem): Observable<any> {
    const url: string = `/ChartSet/Create?name=${dashboard.Name}`;

    return this.apiService.POST(url)
      .pipe(
        filter((value: number) => !!value && value > 0)
      );        
  }

  updateDashboard(dashboard: DashboardItem): Observable<any> {
    const url: string = `/ChartSet/Update?chartSetId=${dashboard.Id}&name=${dashboard.Name}`;

    return this.apiService.POST(url)
      .pipe(
        filter((value: number) => !!value && value > 0)
      );       
  }

  deleteDashboard(dashboard: DashboardItem): Observable<any> {
    const url: string = `/ChartSet/Delete?chartSetId=${dashboard.Id}`;

    return this.apiService.POST(url)
      .pipe(
        filter((value: number) => !!value && value > 0)
      );       
  }

  saveDashboardSettings(dashboardSetting: DashboardSetting): Observable<any> {
    const url: string = `/DashBoardSettings/CreateOrUpdate`;

    return this.apiService.POST(url, dashboardSetting)    
  }

  // charts
  createChart(chart: ChartConfigItem): Observable<any> {
    const url: string = '/ChartConfig/Create';

    return this.apiService.POST(url, chart)
      .pipe(
        filter((value: number) => !!value && value > 0)
      );        
  }

  updateChart(chart: ChartConfigItem, forceReload: boolean = true): Observable<any> {
    const url: string = '/ChartConfig/Update';

    return this.apiService.POST(url, chart)
      .pipe(
        filter((value: boolean) => value && forceReload),

        tap(_ => this.reloadData$.next(chart.ChartConfigId))
      );                
  }

  deleteChart(chart: ChartConfigItem): Observable<any> {
    const url: string = `/ChartConfig/Delete?chartConfigId=${chart.ChartConfigId}`;

    return this.apiService.POST(url)                 
  }

  loadChartResults(id: number, startDate: Date, endDate: Date): Observable<any>{
    const url: string = '/DataEntries/GetDataEntriesByObjectId';

    return this.apiService.POST(url, {
      ChartId: id,
      StartingDate: startDate,
      EndingDate: endDate        
    });        
    
  }

  // visuals
  createVisual(visual: VisualConfigItem): Observable<any> {
    const url: string = '/VisualItemConfig/Create';

    return this.apiService.POST(url, visual)
      .pipe(
        filter((value: number) => !!value && value > 0)
      );        
  }

  updateVisual(visual: VisualConfigItem): Observable<any> {
    const url: string = '/VisualItemConfig/Update';

    return this.apiService.POST(url, visual)
      .pipe(
        filter((value: boolean) => value),
      );                
  }

  deleteVisual(visual: VisualConfigItem): Observable<any> {
    const url: string = `/VisualItemConfig/Delete?visualItemConfigId=${visual.VisualConfigId}`;

    return this.apiService.POST(url)                 
  }

  // load visuals by dashboard
  loadVisualsByDashboard(id: number): Observable<any>{
    const url: string = `/VisualItemConfig/Get?visualItemConfigId=${id}`;

    return this.apiService.GET(url);
  }

  // snapshots
  createSnapshot(snapshot: SnapshotConfigItem): Observable<any> {
    const url: string = '/SnapShotConfig/Create';

    return this.apiService.POST(url, snapshot)
      .pipe(
        filter((value: number) => !!value && value > 0)
      );        
  }

  updateSnapshot(snapshot: SnapshotConfigItem): Observable<any> {
    const url: string = '/SnapShotConfig/UpdateSnapShotConfig';

    return this.apiService.POST(url, snapshot)
      .pipe(
        filter((value: boolean) => value),

        tap(_ => this.reloadData$.next(snapshot.SnapShotConfigId))
      );                
  }

  deleteSnapshot(snapshot: SnapshotConfigItem): Observable<any> {
    const url: string = `/SnapShotConfig/DeleteSnapShot?SnapShotConfigId=${snapshot.SnapShotConfigId}`;

    return this.apiService.POST(url)                 
  }

  // load snapshots by dashboard
  loadSnapshotsByDashboard(id: number): Observable<any>{
    const url: string = `/SnapShotConfig/GetSnapShotConfigByDashBoardId?SnapShotConfigId=${id}`;

    return this.apiService.GET(url);
  }

  loadSnapshotTableResults(id: number, startDate: Date, endDate: Date): Observable<any>{
    const url: string = '/DataEntries/GetTAbleDataEntriesByObjectId';

    return this.apiService.POST(url, {
      ChartId: id,
      StartingDate: startDate,
      EndingDate: endDate        
    });        
    
  }

  loadSnapshotResults(id: number, startDate: Date, endDate: Date): Observable<any>{
    const url: string = '/DataEntries/GetDataEntriesByObjectId';

    return this.apiService.POST(url, {
      ChartId: id,
      StartingDate: startDate,
      EndingDate: endDate        
    });        
    
  }

}
