import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { filter, skip, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { SnapshotConfigItem } from 'src/app/core/models/SnapshotConfigItem';
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

export interface SnapshotTypes {
  snapshotType: number;
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

  // supported visual types
  visualTypes: VisualTypes[] = [];
  // visual item to edit
  visual: VisualConfigItem;
  saveVisual$ = new Subject<void>();

  // supported snapshot types
  snapshotTypes: SnapshotTypes[] = [];
  // snapshot to edit
  snapshot: SnapshotConfigItem;
  saveSnapshot$ = new Subject<void>();

  // datasources to use on widgets
  availableDatasources: DataSourceItem[] = [];   

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

    this.snapshotTypes = [
      { snapshotType: 0, description: 'card' },
      { snapshotType: 1, description: 'table' },
      { snapshotType: 2, description: 'list' },
      { snapshotType: 3, description: 'gauge' }
    ]
    
    this.reset();
    const chart = this.dashboardService.chart$.value;
    const visual = this.dashboardService.visual$.value;
    const snapshot = this.dashboardService.snapshot$.value;
    // use chart if exists
    if(chart) { this.chart = chart }
    // use visual if exists
    if(visual) { this.visual = visual }
    // use snapshot if exists
    if(snapshot) { this.snapshot = snapshot }

    // widget in edition [chart]
    this.dashboardService.chart$
      .pipe(
        skip(1),

        takeUntil(this.destroy$),
        
        tap(_ => this.reset()),

        filter(value => !!value)
      )
      .subscribe((value: ChartConfigItem) => { 
        this.chart = value
      });
    
    // widget in edition [visual]
    this.dashboardService.visual$
      .pipe(
        skip(1),

        takeUntil(this.destroy$),
        
        tap(_ => this.reset()),

        filter(value => !!value)
      )
      .subscribe((value: VisualConfigItem) => { 
        this.visual = value
      });

    // widget in edition [snapshot]
    this.dashboardService.snapshot$
      .pipe(
        skip(1),

        takeUntil(this.destroy$),
        
        tap(_ => this.reset()),

        filter(value => !!value)
      )
      .subscribe((value: SnapshotConfigItem) => { 
        this.snapshot = value
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
    
    // save snapshot
    this.saveSnapshot$
    .pipe(
      switchMap(_ => this.saveSnapshot())
    )
    .subscribe(value => {
      // case of creation
      if(typeof value === 'number'){ 
        this.snapshot.SnapShotConfigId = value;
      }
      
      console.log('snapshot saved', value)
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

    this.availableDatasources = this.systemService.dataSourcesInUse;
  }

  onDrag(event, widgetConfig) {
    event.dataTransfer.setData('widgetConfig', JSON.stringify(widgetConfig));
  }

  // charts
  private saveChart(): Observable<any> {
    
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


  // snapshots
  private saveSnapshot(): Observable<any> {
    return this.snapshot.SnapShotConfigId < 0 
      ? this.dashboardService.createSnapshot(this.snapshot)
        .pipe(
          tap((value: number) => this.snapshot.SnapShotConfigId = value)
        )
      : this.dashboardService.updateSnapshot(this.snapshot);
  }

  // check if it is disable or is compatible with other
  isSnapshotWidgetDisabled(type: any): boolean {
    if(this.chart || this.visual) { return true; }
    if(!this.snapshot) { return false; }
    
    // there is no compatibility
    return this.snapshot.SnapshotType !== type.snapshotType;
  }
}
