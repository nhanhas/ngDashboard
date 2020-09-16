import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
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
export class WidgetToolboxComponent implements OnInit {

  // supported chart types
  chartTypes: ChartTypes[] = [];

  // chart to edit
  chart: ChartConfigItem;

  // visual item to edit
  visual: any;

  constructor(
    private dashboardService: DashboardService
  ) { }

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
        tap(_ => this.reset())
      )
      .subscribe((value: ChartConfigItem) => this.chart = value);

    

  }

  // reset elements in edition
  private reset() {
    this.visual = undefined;
    this.chart = undefined;
  }

  onDrag(event, identifier) {
		event.dataTransfer.setData('chartType', identifier);
  }

  // change chart type on the fly (only edit mode)
  changeChartType(type: any) {
    this.chart.chartType = type.chartType;
  }

  // check if it is disable or is compatible with other
  isChartWidgetDisabled(type: any): boolean {
    if(!this.chart) { return false; }

    const activeTypeCompatibility = this.chartTypes.find(value => value.chartType === this.chart.chartType).sameAs;

    return type.chartType !== this.chart.chartType 
    ? !activeTypeCompatibility.find((value: string) => value === type.chartType)
    : false   
  }
  
  // we are editing element or creating a new one
  get isEditing(): boolean {
    return !!this.chart || !!this.visual;
  }

}
