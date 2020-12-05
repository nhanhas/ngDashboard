import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { SystemService } from 'src/app/core/system.service';

export class DashboardFilter {
  Id: number;
  Name: string;
  startDateFilter: Date = new Date();
  endDateFilter: Date = new Date();
}

@Component({
  selector: 'app-filter-toolbox',
  templateUrl: './filter-toolbox.component.html',
  styleUrls: ['./filter-toolbox.component.scss']
})
export class FilterToolboxComponent implements OnInit {

  dashboards: DashboardItem[] = [];

  filters: DashboardFilter[] = [];

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private systemService: SystemService) { }

  ngOnInit() {
    this.systemService.dashboards$
      .pipe(      
        takeUntil(this.destroy$),
      )
      .subscribe((value: DashboardItem[]) => {
        this.dashboards = value;

        this.dashboards.forEach((value: DashboardItem) => {
          const startDateFilter = value.Settings.find((setting: {key: string, value: string}) => setting.key === 'startDateFilter');
          const endDateFilter = value.Settings.find((setting: {key: string, value: string}) => setting.key === 'endDateFilter');
          if(!!startDateFilter && !!endDateFilter) {
            this.filters.push({Id: value.Id, Name: value.Name, startDateFilter: startDateFilter, endDateFilter: endDateFilter})
          }          
        })

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

}
