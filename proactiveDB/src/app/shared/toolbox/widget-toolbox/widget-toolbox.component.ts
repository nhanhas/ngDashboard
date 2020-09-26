import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { SystemService } from 'src/app/core/system.service';
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
  saveChart$ = new Subject<void>();

  // visual item to edit
  visual: any;

  // datasources to use on widgets
  availableDatasources: DataSourceItem[] = this.systemService.dataSources$.value;
  fieldsInUse: number[] = [];

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private systemService: SystemService,
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

        filter(value => !!value),
        
        tap(_ => this.reset())
      )
      .subscribe((value: ChartConfigItem) => { 
        this.chart = value
        this.updateDatasourceFields(this.chart.Fields);
      });


    // save chart
    this.saveChart$
      .pipe(
        switchMap(_ => this.saveChart())
      )
      .subscribe(value => {
        // case of creation
        if(typeof value === 'number'){ 
          this.chart.ChartConfigId = value;
        }
        
        console.log('chart saved', value)
      });
    
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

    this.fieldsInUse = [];
  }

  // update fieldsInUse collection
  updateDatasourceFields(widgetFields: any[]) {
    // which tables are in use
    this.availableDatasources.forEach(db => {
      db.itens.forEach(table => {
        table.itens.forEach(field => {
            if(widgetFields.find(item => item.metaDataEntryId === field.MetadataEntryId)){
              this.fieldsInUse.push(field.MetadataEntryId);
            }
          })        
      })        
    })
  }

  onDrag(event, widgetConfig) {
    event.dataTransfer.setData('widgetConfig', JSON.stringify(widgetConfig));
  }

  // charts
  private saveChart(): Observable<any> {
    return this.chart.ChartConfigId < 0 
      ? this.dashboardService.createChart(this.chart)
      : this.dashboardService.updateChart(this.chart);
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
