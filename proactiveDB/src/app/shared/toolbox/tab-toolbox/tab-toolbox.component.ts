import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { skip, takeUntil, tap, filter, switchMap } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { SystemService } from 'src/app/core/system.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-tab-toolbox',
  templateUrl: './tab-toolbox.component.html',
  styleUrls: ['./tab-toolbox.component.scss']
})
export class TabToolboxComponent implements OnInit {

  // dashboard to edit
  dashboard: DashboardItem;
  saveDashboard$ = new Subject<void>();

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private systemService: SystemService,
    private dashboardService: DashboardService,
    private router: Router) { }

  ngOnInit() {


    // dashboard in edition
    this.dashboardService.dashboardTab$
      .pipe(      

        takeUntil(this.destroy$),
        
        tap(_ => this.reset()),

        tap(value => { 
          if(!value) { this.router.navigate(['/', { outlets: {toolbox: null} } ]) } 
        }),
        
        filter(value => !!value)
      )
      .subscribe((value: DashboardItem) => { 
        this.dashboard = value
      });

    // save chart
    this.saveDashboard$
    .pipe(
      switchMap(_ => this.saveDashboard())
    )
    .subscribe(value => {
      // case of creation
      if(typeof value === 'number'){ 
        this.dashboard.Id = value;
      }
      
      console.log('dashboard saved', value)
    });
  }

  // reset dashboard in edition
  private reset() {
    this.dashboard = undefined;
  }

  // charts
  private saveDashboard(): Observable<any> {
    
    return this.dashboard.Id < 0 
      ? this.dashboardService.createDashboard(this.dashboard)
        .pipe(
          tap((value: number) => this.dashboard.Id = value),
        )
      : this.dashboardService.updateDashboard(this.dashboard);
  }

}
