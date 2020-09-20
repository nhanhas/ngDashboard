import { Injectable } from '@angular/core';
import { BehaviorSubject, concat, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DataSourceItem } from './models/DataSourceItem';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  // available datasources for later use in all app
  dataSources$ = new BehaviorSubject<any[]>([]);

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
          )          
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

}