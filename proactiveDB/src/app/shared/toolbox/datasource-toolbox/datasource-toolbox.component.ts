import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { SystemService } from 'src/app/core/system.service';

@Component({
  selector: 'app-datasource-toolbox',
  templateUrl: './datasource-toolbox.component.html',
  styleUrls: ['./datasource-toolbox.component.scss']
})
export class DatasourceToolboxComponent implements OnInit, OnDestroy {

  availableDatasources: DataSourceItem[] = [];

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private systemService: SystemService) { }

  ngOnInit() {
    this.systemService.dataSources$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((value: DataSourceItem[]) => this.availableDatasources = value)
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
