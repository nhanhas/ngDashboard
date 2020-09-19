import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChartConfigItem } from '../core/models/ChartConfigItem';
import { DashboardItem } from '../core/models/DashboardItem';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // widgets in edition
  chart$ = new BehaviorSubject<ChartConfigItem>(null);
  visual$ = new BehaviorSubject<any>(null); // TODO - class visualconfig

  dashboardTab$ = new BehaviorSubject<DashboardItem>(null);

  constructor() { }

  // clear edition toolbox
  clearWidgetsEdition() {
    this.chart$.next(undefined);
    this.visual$.next(undefined);
  }

}
