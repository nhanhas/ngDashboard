import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChartConfigItem } from '../core/models/ChartConfigItem';
import { DashboardItem } from '../core/models/DashboardItem';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  chart$ = new BehaviorSubject<ChartConfigItem>(null);
  dashboardTab$ = new BehaviorSubject<DashboardItem>(null);

  constructor() { }

}
