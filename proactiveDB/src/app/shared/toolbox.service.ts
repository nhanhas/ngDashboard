import { Injectable } from '@angular/core';
import { DashboardItem } from '../core/models/DashboardItem';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolboxService {

  dashboard = new Subject<DashboardItem>();

  constructor() { }
}
