import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

export interface ChartTypes {
  chartType: string;
  sameAs: string[];
}

@Component({
  selector: 'app-widget-toolbox',
  templateUrl: './widget-toolbox.component.html',
  styleUrls: ['./widget-toolbox.component.scss']
})
export class WidgetToolboxComponent implements OnInit, OnDestroy {

  // supported chart types
  chartTypes: ChartTypes[] = [];

  // chart to edit
  chart: ChartConfigItem;

  // visual item to edit
  visual: any;

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private dashboardService: DashboardService) { }

  ngOnInit() {

    // TODO - load chart types from api
    this.chartTypes = [
      { chartType: 'line', sameAs: ['bar']},
      { chartType: 'bar', sameAs: ['line']},
      { chartType: 'pie', sameAs: ['polar']},
      { chartType: 'radar', sameAs: []},
      { chartType: 'polar', sameAs: ['pie']},
      { chartType: 'bubble', sameAs: [] }
    ]

    // widget in edition [chart]
    this.dashboardService.chart$
      .pipe(
        takeUntil(this.destroy$),

        tap(_ => this.reset())
      )
      .subscribe((value: ChartConfigItem) => this.chart = value);

  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();

    // clear widget in edition
    this.dashboardService.clearWidgetsEdition();
  }

  // reset elements in edition
  private reset() {
    this.visual = undefined;
    this.chart = undefined;
  }

  onDrag(event, identifier) {
		event.dataTransfer.setData('ChartType', identifier);
  }

  // change chart type on the fly (only edit mode)
  changeChartType(type: any) {
    this.chart.ChartType = type.chartType;
  }

  // check if it is disable or is compatible with other
  isChartWidgetDisabled(type: any): boolean {
    if(!this.chart) { return false; }

    const activeTypeCompatibility = this.chartTypes.find(value => value.chartType === this.chart.ChartType).sameAs;

    return type.chartType !== this.chart.ChartType 
    ? !activeTypeCompatibility.find((value: string) => value === type.chartType)
    : false   
  }
  
  // we are editing element or creating a new one
  get isEditing(): boolean {
    return !!this.chart || !!this.visual;
  }

}
