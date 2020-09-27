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
  availableXDatasources: DataSourceItem[] = [];  
  availableYDatasources: DataSourceItem[] = [];  

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
        this.updateDatasourceFields(this.availableYDatasources, this.chart.Fields);
        this.updateDatasourceFields(this.availableXDatasources, [ {metaDataEntryId: this.chart.XAxisMetadataEntry} ]);
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

    this.availableYDatasources = this.systemService.dataSourcesInUse    
    this.availableXDatasources = this.systemService.dataSourcesInUse    
  }

  // update datasource fields collection for tree
  updateDatasourceFields(axisDatasource: DataSourceItem[], widgetFields: any[]) {
    // which tables are in use
    axisDatasource.forEach(db => {
      db.itens.forEach(table => {
        table.itens.forEach(field => {     
          // select if in use or unselect otherwise
          field.selected = !!widgetFields.find(item => item.metaDataEntryId === field.MetadataEntryId);        
          })        
      })        
    })
  }

  // update chart config fields collection
  updateChartFieldsInUse() {
    // x axis
    this.availableYDatasources.forEach(db => {
      db.itens.forEach(table => {
        const fieldsSelected: DataSourceItem [] = table.itens.filter(field => field.selected)
        // should be only 1
        if(!!fieldsSelected.length){
          this.chart.XAxisMetadataEntry = fieldsSelected[0].MetadataEntryId;           
          return;
        }
      })        
    });

    // y axis
    let fieldsInUse = [];
    this.availableYDatasources.forEach(db => {
      db.itens.forEach(table => {
        const fieldsSelected: DataSourceItem [] = table.itens.filter(field => field.selected)
        fieldsInUse = fieldsInUse.concat(fieldsSelected.map(field => (
          {
            metaDataEntryId: field.MetadataEntryId,
            serviceId: field.serviceId            
          })
        ))
      })        
    })

    this.chart.Fields = fieldsInUse;
  }

  onDrag(event, widgetConfig) {
    event.dataTransfer.setData('widgetConfig', JSON.stringify(widgetConfig));
  }

  // charts
  private saveChart(): Observable<any> {
    this.updateChartFieldsInUse();
    
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
