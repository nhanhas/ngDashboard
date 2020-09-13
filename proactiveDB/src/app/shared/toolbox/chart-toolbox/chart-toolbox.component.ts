import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-chart-toolbox',
  templateUrl: './chart-toolbox.component.html',
  styleUrls: ['./chart-toolbox.component.scss']
})
export class ChartToolboxComponent implements OnInit {

  chart: ChartConfigItem;

  constructor(
    private router: Router,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    // chart in edition
    this.dashboardService.chart$
      .pipe(
        tap((value: ChartConfigItem) => {
          // close toolbox in case of no object to edit
          if(!value) { this.router.navigate(['/', { outlets: { toolbox: null } }]) }
        })
      )
      .subscribe((value: ChartConfigItem) => this.chart = value);
  }

}
