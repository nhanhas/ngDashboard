import { Injectable } from '@angular/core';
import { BehaviorSubject, concat, forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DashboardItem } from './models/DashboardItem';
import { DataSourceItem } from './models/DataSourceItem';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  // available datasources for later use in all app
  dataSources$ = new BehaviorSubject<any[]>([]);
  dashboards$ = new BehaviorSubject<DashboardItem[]>([]);

  constructor(
    private apiService: ApiService) { }

  // start system
  start(authServce: any): Promise<boolean>  {
    return new Promise((resolve, reject) => {
      
      // TODO - check for user logged in
      authServce.isLoggedIn = true;

      // get all needed data before ready to use
      let startupData = [
        this.loadDataSources()
          .pipe(
            tap(value => console.log(value)),
            tap(value => this.dataSources$.next(value))
          ),
          
        this.loadDashboards()
          .pipe(
            tap(value => console.log(value)),
              // store dashboards into behaviour
              tap(value => console.log('system service', value)),
              
              tap((value: DashboardItem[]) => this.dashboards$.next(value)),
          ),
      ]

      concat(...startupData)
        .subscribe({
          next: () => {},
          complete: () => resolve(true)
        })
      
    })
  }


  private loadDataSources(): Observable<DataSourceItem[]> {
    const url: string = '/datasource/getsets';

    return this.apiService.GET(url)
      .pipe(
        map(value => value.map(dataSource => Object.assign(new DataSourceItem(), dataSource)))
      );    
  }

  // load dashboards from server
  private loadDashboards(): Observable<DashboardItem[]> {
    const url: string = '/ChartSet/GetDashBoards';

    return this.apiService.GET(url)
      .pipe(
        // parse to known model
        map((value: any[]) => value.map(item =>  Object.assign(new DashboardItem(), item))),
      
        // load dashboards settings
        mergeMap((value: DashboardItem[]) => {
          // prepare chart request for each dasbhoard item
          const settings = value.map((dashboard: DashboardItem) => {
            return this.loadSettingsByDashboard(dashboard.Id)
              .pipe(
                tap((settings: { key: string, value: string }[]) => {
                  
                  // assign settings to dashboard
                  dashboard.Settings = settings
                })
              )
          });

          // TODO - add more items here to load and then , forkJoin
          return forkJoin([...settings])
            .pipe(
              map(_ => value)
            );
        })

      )      
  }

  // load settings by dashboard id
  private loadSettingsByDashboard(id: number): Observable<{ key: string, value: string }[]>{
    const url: string = `/DashBoardSettings/GetDashBoardSettingsByDashBoardId?dashBoardId=${id}`;

    return this.apiService.GET(url)
      .pipe(
        // parse to known model
        map((value: any[]) => value.map(item =>  Object.assign({}, item)))        
      )
  }

  get dataSourcesInUse(): DataSourceItem[] {
    return this.dataSources$.value;
  }  

}