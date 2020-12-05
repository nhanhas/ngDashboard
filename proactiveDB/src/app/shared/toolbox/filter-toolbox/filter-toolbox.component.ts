import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { SystemService } from 'src/app/core/system.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

export class DashboardFilter {
  Id: number;
  Name: string;
  startDateFilter: Date = new Date();
  endDateFilter: Date = new Date();
}

export class DashboardSetting {
  DashboardId: number;
  KeyValues: {key: string, value: string}[] = [];
}

@Component({
  selector: 'app-filter-toolbox',
  templateUrl: './filter-toolbox.component.html',
  styleUrls: ['./filter-toolbox.component.scss']
})
export class FilterToolboxComponent implements OnInit {

  dashboards: DashboardItem[] = [];

  filters: DashboardFilter[] = [];

  saveFilters$ = new Subject<void>();

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private dashboardService: DashboardService,
    private systemService: SystemService) { }

  ngOnInit() {
    this.systemService.dashboards$
      .pipe(      
        takeUntil(this.destroy$),
      )
      .subscribe((value: DashboardItem[]) => {
        this.dashboards = value;

        this.dashboards.forEach((value: DashboardItem) => {
          const startDateFilter = value.Settings.find((setting: {Key: string, Value: string}) => setting.Key === 'startDateFilter');
          const endDateFilter = value.Settings.find((setting: {Key: string, Value: string}) => setting.Key === 'endDateFilter');
          if(!!startDateFilter && !!endDateFilter) {
            this.filters.push({Id: value.Id, Name: value.Name, startDateFilter: new Date(startDateFilter.Value), endDateFilter: new Date(endDateFilter.Value)})
          }          
        })

      });

    // save changes
    this.saveFilters$
      .pipe(
        switchMap(_ => this.saveFilters())
      )
      .subscribe(value => {
        // shoot updates for dashboards
        this.dashboardService.dateFiltersChanged$.next();
      })
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  newFilter() {
    this.filters.push(new DashboardFilter());
  }

  saveFilters(): Observable<any> {
    let dashboardSettings: DashboardSetting[] = [];
    this.filters.forEach(filter => {
      dashboardSettings.push(
        {
          DashboardId: filter.Id,
          KeyValues: [
            { key: 'startDateFilter', value: filter['startDateFilter'].toISOString().split('T')[0] },
            { key: 'endDateFilter', value: filter['endDateFilter'].toISOString().split('T')[0] }
          ]
        }
      )
    });

    // prepare chart request for each dasbhoard item
    const filters = dashboardSettings.map((settings: DashboardSetting) => {
      return this.dashboardService.saveDashboardSettings(settings)        
    });

    // TODO - add more items here to load and then , forkJoin
    return forkJoin([...filters])
  }

}
