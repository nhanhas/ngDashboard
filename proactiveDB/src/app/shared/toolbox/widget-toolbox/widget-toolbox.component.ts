import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { VisualConfigItem } from 'src/app/core/models/VisualConfigItem';
import { SystemService } from 'src/app/core/system.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

export interface ChartTypes {
  chartType: string;
  sameAs: string[];
}

export interface VisualTypes {
  visualType: number;
  description: string;
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

  // datasources to use on widgets
  availableXDatasources: DataSourceItem[] = [];  
  availableYDatasources: DataSourceItem[] = [];  

  // supported visual types
  visualTypes: VisualTypes[] = [];

  // visual item to edit
  visual: VisualConfigItem;
  saveVisual$ = new Subject<void>();

  // snapshot item to edit
  snapshot: any;

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
    ];

    this.visualTypes = [
      { visualType: 1, description: 'container' },
      { visualType: 2, description: 'label' },
    ]

    // widget in edition [chart]
    this.dashboardService.chart$
      .pipe(
        takeUntil(this.destroy$),
        
        tap(_ => this.reset()),

        filter(value => !!value)
      )
      .subscribe((value: ChartConfigItem) => { 
        this.chart = value
        this.updateDatasourceFields(this.availableYDatasources, this.chart.Fields);
        this.updateDatasourceFields(this.availableXDatasources, [ {metaDataEntryId: this.chart.XAxisMetadataEntry} ]);
      });
    
    // widget in edition [visual]
    this.dashboardService.visual$
      .pipe(
        takeUntil(this.destroy$),
        
        tap(_ => this.reset()),

        filter(value => !!value)
      )
      .subscribe((value: VisualConfigItem) => { 
        this.visual = value
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
    
    // save visual
    this.saveVisual$
    .pipe(
      switchMap(_ => this.saveVisual())
    )
    .subscribe(value => {
      // case of creation
      if(typeof value === 'number'){ 
        this.visual.VisualConfigId = value;
      }
      
      console.log('visual saved', value)
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
    this.availableXDatasources.forEach(db => {
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
            name: field.name,
            description: field.description,
            metaDataEntryId: field.MetadataEntryId,
            serviceId: field.serviceId,
            function: 0 
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
        .pipe(
          tap((value: number) => this.chart.ChartConfigId = value),
          tap(_ => this.dashboardService.reloadData$.next(this.chart.ChartConfigId))
        )
      : this.dashboardService.updateChart(this.chart);
  }

  // change chart type on the fly (only edit mode)
  changeChartType(type: any) {
    this.chart.ChartType = type.chartType;
  }

  // check if it is disable or is compatible with other
  isChartWidgetDisabled(type: any): boolean {
    if(this.visual || this.snapshot) { return true; }
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

  // visuals
  private saveVisual(): Observable<any> {
    
    return this.visual.VisualConfigId < 0 
      ? this.dashboardService.createVisual(this.visual)
        .pipe(
          tap((value: number) => this.visual.VisualConfigId = value)
        )
      : this.dashboardService.updateVisual(this.visual);
  }

  // check if it is disable or is compatible with other
  isVisualWidgetDisabled(type: any): boolean {
    if(this.chart || this.snapshot) { return true; }
    if(!this.visual) { return false; }
    
    // there is no compatibility
    return this.visual.VisualType !== type.visualType;
  }

}
