import { Component, OnInit, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem, GridType }  from 'angular-gridster2';
import { Router } from '@angular/router';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ChartComponent } from 'src/app/shared/chart/chart.component';
import { DashboardService } from '../dashboard.service';
import { ApiService } from 'src/app/core/api.service';
import { forkJoin, Observable, of } from 'rxjs';
import { filter, map, mergeMap, take, takeUntil, tap } from 'rxjs/operators';
import { VisualConfigItem } from 'src/app/core/models/VisualConfigItem';
import { SystemService } from 'src/app/core/system.service';
import { SnapshotConfigItem } from 'src/app/core/models/SnapshotConfigItem';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('tabs')tabs: MatTabGroup;

  // grid options
  options: GridsterConfig = {
    gridType: GridType.Fixed,
    enableEmptyCellDrop: true,      
    emptyCellDropCallback: this.onDrop.bind(this),
    draggable: {
      enabled: true,
      dropOverItems: true,
      ignoreContent: true,
      dragHandleClass: "drag-handler",
      ignoreContentClass: "no-drag",
    },
    resizable: {
      enabled: true,
    },
    minCols: 1,
    maxCols: 100,
    minRows: 1,
    maxRows: 100,
    maxItemCols: 100,
    minItemCols: 1,
    maxItemRows: 100,
    minItemRows: 1,
    maxItemArea: 2500,
    minItemArea: 1,
    defaultItemCols: 1,
    defaultItemRows: 1,
    fixedColWidth: 32,
    fixedRowHeight: 32,
    itemChangeCallback: this.itemChange.bind(this),
    itemResizeCallback: this.itemResize.bind(this),
    allowMultiLayer: true,
    defaultLayerIndex: 2
  };

  dashboard: GridsterItem[] = [];

  // dashboard from server
  dashboards: DashboardItem[] = [];

  ready: boolean;

  constructor(
    private router: Router,
    private systemService: SystemService,
    private dashboardService: DashboardService) { }

  ngOnInit() {

    this.dashboard = [
      {cols: 2, rows: 1, y: 0, x: 0},
      {cols: 2, rows: 2, y: 0, x: 2}
    ];

    // load dashboards
    //this.loadDashboards() - now we load dashboards in systemService
    this.systemService.dashboards$
      .pipe(
        take(1),

        filter((value: DashboardItem[]) => value && !!value.length),

        tap((value: DashboardItem[]) => this.dashboards = value),

        // load items by dashboard
        mergeMap((value: DashboardItem[]) => {
          // prepare chart request for each dasbhoard item
          const charts = value.map((dashboard: DashboardItem) => {
            return this.loadChartsByDashboard(dashboard.Id)
              .pipe(
                tap((charts: ChartConfigItem[]) => {
                  
                  // assign charts to dashboard
                  dashboard.charts = charts
                })
              )
          });

          // prepare visual request for each dasbhoard item
          const visuals = value.map((dashboard: DashboardItem) => {
            return this.loadVisualsByDashboard(dashboard.Id)
              .pipe(
                tap((visuals: VisualConfigItem[]) => {
                  
                  // assign visuals to dashboard
                  dashboard.visuals = visuals
                })
              )
          });

          // prepare snapshot request for each dasbhoard item
          const snapshots = value.map((dashboard: DashboardItem) => {
            return this.loadSnapshotsByDashboard(dashboard.Id)
              .pipe(
                tap((snapshots: SnapshotConfigItem[]) => {
                  
                  // assign snapshots to dashboard
                  dashboard.snapshots = snapshots
                })
              )
          });

          // TODO - add more items here to load and then , forkJoin
          return forkJoin([...charts, ...visuals, ...snapshots])
            .pipe(
              map(_ => value)
            );
        })
      )      
      .subscribe((value: DashboardItem[]) => {
        // update charts dashboard due to grister config
        this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
          chart.gridConfig = { x: chart.PosX, y: chart.PosY, cols: chart.Width, rows: chart.Heigth, collection: 'charts', id: chart.ChartConfigId, layerIndex: 2 }
          }) 
        )

        // update visuals dashboard due to grister config
        this.dashboards.forEach(value => value.visuals.forEach((visual:VisualConfigItem) => {
          visual.gridConfig = { x: visual.PosX, y: visual.PosY, cols: visual.Width, rows: visual.Heigth, collection: 'visuals', id: visual.VisualConfigId, layerIndex: 2 }
          }) 
        )

        // update snapshots dashboard due to grister config
        this.dashboards.forEach(value => value.snapshots.forEach((snapshot:SnapshotConfigItem) => {
          snapshot.gridConfig = { x: snapshot.PosX, y: snapshot.PosY, cols: snapshot.Width, rows: snapshot.Heigth, collection: 'snapshots', id: snapshot.SnapShotConfigId, layerIndex: 2 }
          }) 
        )

        this.ready = true;
      })

    // listen for filter changes
    this.dashboardService.dateFiltersChanged$
      .subscribe(_ => {
        const dashboardActive = this.dashboards[this.activeDashboard];
        
        // trigger each visible chart update
        dashboardActive.charts.forEach((chart: ChartConfigItem) => this.dashboardService.reloadData$.next(chart.ChartConfigId))
        
        // trigger each visible snapshot update
        dashboardActive.snapshots.forEach((snapshot: SnapshotConfigItem) => this.dashboardService.reloadData$.next(snapshot.SnapShotConfigId))
      })
  }
  
  // load dashboards from server
  private loadDashboards(): Observable<DashboardItem[]> {
    return this.dashboardService.loadDashboards()
      .pipe(
        // parse to known model
        map((value: any[]) => value.map(item =>  Object.assign(new DashboardItem(), item)))
      )      
  }

  // load chart by dashboard id
  private loadChartsByDashboard(id: number): Observable<ChartConfigItem[]>{
    return this.dashboardService.loadChartByDashboard(id)
      .pipe(
         // parse to known model
         map((value: any[]) => value.map(item =>  Object.assign(new ChartConfigItem(), item)))        
      )
  }

  // load visual by dashboard id
  private loadVisualsByDashboard(id: number): Observable<VisualConfigItem[]>{
    return this.dashboardService.loadVisualsByDashboard(id)
      .pipe(
          // parse to known model
          map((value: any[]) => value.map(item =>  Object.assign(new VisualConfigItem(), item)))        
      )
  }

  // load visual by dashboard id
  private loadSnapshotsByDashboard(id: number): Observable<SnapshotConfigItem[]>{
    return this.dashboardService.loadSnapshotsByDashboard(id)
      .pipe(
          // parse to known model
          map((value: any[]) => value.map(item =>  Object.assign(new SnapshotConfigItem(), item)))        
      )
  }

  // development only
  private setupDashboards() {
    const chart1: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      chartConfigId: 1,
      description: 'chart 1',
      chartType: 'line',
      posX: 0, posY: 0,
      width: 10, heigth: 6
    })

    const chart2: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      chartConfigId: 2,
      description: 'chart 2',
      chartType: 'pie',
      posX: 4, posY: 6,
      width: 10, heigth: 6
    })

    const chart3: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      chartConfigId: 3,
      description: 'bar',
      posX: 1, posY: 2,
      width: 2, heigth: 1
    })

    this.dashboards = [
      {... new DashboardItem(), Name: 'Dash 1', charts: [chart1, chart2], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 2', charts: [chart3], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 3', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 4', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 5', charts: [], snapshots: [], visuals: []},

      {... new DashboardItem(), Name: 'Dash 6', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 7', charts: [], snapshots: [], visuals: []},

      {... new DashboardItem(), Name: 'Dash 8', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 9', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 10', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), Name: 'Dash 11', charts: [], snapshots: [], visuals: []},
    ];

    this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
      chart.gridConfig = { x: chart.PosX, y: chart.PosY, cols: chart.Width, rows: chart.Heigth, collection: 'charts', id: chart.ChartConfigId }
      }) 
    )

  }

  // on change widget
  itemChange(item, itemComponent) {
    // collection: 'charts', snapshots, visuals from dashboard
    const { collection, id } = item;

    // pick right id field of widget
    let idField;
    if(collection === 'charts') { idField = 'ChartConfigId' };
    if(collection === 'snapshots') { idField = 'SnapShotConfigId' };
    if(collection === 'visuals') { idField = 'VisualConfigId' };
    
    // refresh model positions before update on server
    this.refreshPositionFields();

    // get item changed
    const itemChanged = this.dashboards[this.activeDashboard][collection].find(value => value[idField] === +id);
    
    // chart update
    if(itemChanged instanceof ChartConfigItem) { this.updateChart(itemChanged) }

    // visual update
    if(itemChanged instanceof VisualConfigItem) { this.updateVisual(itemChanged) }

    // snapshot update
    if(itemChanged instanceof SnapshotConfigItem) { this.updateSnapshot(itemChanged) }

    console.log('changed widget dimensions', itemChanged);
  }

  itemResize(item, itemComponent) {
    const itemChanged = this.dashboards[this.activeDashboard].charts.find((value: ChartConfigItem) => value.ChartConfigId === +itemComponent.el.id);
  }

  changedOptions() {
    this.options.api.optionsChanged();
  }

  removeItem(item) {
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
  }

  addItem() {
    this.dashboard.push({} as GridsterItem);
  }

  // edit dashboard (tab)
  newDashboard() {
    const unsavedDashboardId = this.dashboards.reduce((min, dashboard) => dashboard.Id < min ? dashboard.Id : min, 0)

    const newDashboard = Object.assign(new DashboardItem(), {Id: unsavedDashboardId - 1, Name: 'New'});
    this.dashboards.push(newDashboard);

    this.editDashboard(newDashboard.Id);
  }

  editDashboard(id: number) {
    const dashboard = this.dashboards.find(tab => tab.Id === id);
    
    // set dashboard in edition
    this.dashboardService.dashboardTab$.next(dashboard);
    
    this.router.navigate(['/', { outlets: {toolbox: 'tab-toolbox'} } ])    
  }

  deleteDashboard(id: number) {
    // TODO - prompt user
    const dashboard = this.dashboards.find(tab => tab.Id === id);
    dashboard.Id < 0 
      ? this.dashboards.splice(this.dashboards.indexOf(dashboard), 1)
      : this.dashboardService.deleteDashboard(dashboard)  
        .subscribe( value => value ? this.dashboards.splice(this.dashboards.indexOf(dashboard), 1) : null);
  }

  /**
   * Chart
   */
  editChart(chart: ChartConfigItem) {
    event.stopImmediatePropagation();
    
    // set chart in edition
    this.dashboardService.clearWidgetsEdition();
    this.dashboardService.chart$.next(chart);

    this.router.navigate(['/', { outlets: {toolbox: 'widget-toolbox'} } ])
  }

  deleteChart(chart: ChartConfigItem) {
    event.stopImmediatePropagation();
  
    const itemDeleted: ChartConfigItem = this.dashboards[this.activeDashboard].charts.find((value: ChartConfigItem) => value.ChartConfigId === chart.ChartConfigId);

    itemDeleted.ChartConfigId < 0 
    ? this.dashboards[this.activeDashboard].charts.splice(this.dashboards[this.activeDashboard].charts.indexOf(itemDeleted), 1)
    : this.dashboardService.deleteChart(itemDeleted)
        .subscribe(value => {
          console.log('removed chart', value)
          this.dashboards[this.activeDashboard].charts.splice(this.dashboards[this.activeDashboard].charts.indexOf(itemDeleted), 1);
          
          // close panel
          this.router.navigate(['/', { outlets: {toolbox: null} } ])
        })
    
  }
  
  // update chart config on server
  private updateChart(chart: ChartConfigItem) {
    // ingore unsaved charts
    if(chart.ChartConfigId < 0) { return; }

    // update chart
    this.dashboardService.updateChart(chart, false)
      .subscribe(value => {
        console.log(value)
      })
  }

  // specific drop chart handler
  private onDropChart(chartType: string, emptyCellItem: GridsterItem) {
    const unsavedChartId = this.dashboards[this.activeDashboard].charts.reduce((min, chart) => chart.ChartConfigId < min ? chart.ChartConfigId : min, 0)
    const newChart: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      ChartConfigId: unsavedChartId - 1,
      ChartType: chartType,
      ChartSetId: this.dashboards[this.activeDashboard].Id,
      Name: 'new',
      PosX: emptyCellItem.x, PosY: emptyCellItem.y,
      Width: 6, Heigth: 4      
    })

    this.dashboards[this.activeDashboard].charts.push(newChart);

    // edit new chart in toolbox 
    this.editChart(newChart);

    // update grister-item with chartConfig positioning/size
    this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
      chart.gridConfig = { x: chart.PosX, y: chart.PosY, cols: chart.Width, rows: chart.Heigth, collection: 'charts', id: chart.ChartConfigId }
      }) 
    );
  }

  // get id of chart in edition
  get editingChartId(): number {
    if(!this.dashboardService.chart$.value) { return 0 }
    
    const { ChartConfigId } = this.dashboardService.chart$.value;
    return ChartConfigId || 0;
  }

  /**
   * Visuals
   */
  editVisual(visual: VisualConfigItem) {
    event.stopImmediatePropagation();
    
    // set chart in edition
    this.dashboardService.clearWidgetsEdition();
    this.dashboardService.visual$.next(visual);

    this.router.navigate(['/', { outlets: {toolbox: 'widget-toolbox'} } ])
  }

  deleteVisual(visual: VisualConfigItem) {
    event.stopImmediatePropagation();
    const itemDeleted: VisualConfigItem = this.dashboards[this.activeDashboard].visuals.find((value: VisualConfigItem) => value.VisualConfigId === visual.VisualConfigId);

    itemDeleted.VisualConfigId < 0 
    ? this.dashboards[this.activeDashboard].visuals.splice(this.dashboards[this.activeDashboard].visuals.indexOf(itemDeleted), 1)
    : this.dashboardService.deleteVisual(itemDeleted)
        .subscribe(value => {
          console.log('removed visual', value)
          this.dashboards[this.activeDashboard].visuals.splice(this.dashboards[this.activeDashboard].visuals.indexOf(itemDeleted), 1);
          
          // close panel
          this.router.navigate(['/', { outlets: {toolbox: null} } ])
        })
  }

  // update visual config on server
  private updateVisual(visual: VisualConfigItem) {
  // ingore unsaved visual
  if(visual.VisualConfigId < 0) { return; }

  // update visual
  this.dashboardService.updateVisual(visual)
    .subscribe(value => {
      console.log(value)
    })
  }

  // specific drop visual handler
  private onDropVisual(visualType: number, emptyCellItem: GridsterItem) {
    const unsavedVisualId = this.dashboards[this.activeDashboard].visuals.reduce((min, visual) => visual.VisualConfigId < min ? visual.VisualConfigId : min, 0)
    const newVisual: VisualConfigItem = Object.assign(new VisualConfigItem(), {
      VisualConfigId: unsavedVisualId - 1,
      VisualType: visualType,
      DashBoardId: this.dashboards[this.activeDashboard].Id,
      Name: 'new',
      PosX: emptyCellItem.x, PosY: emptyCellItem.y,
      Width: 6, Heigth: 4,    
      Settings: [ {Key: 'layerIndex', Value: visualType === 1 ? 1 : 2} ]  
    })

    this.dashboards[this.activeDashboard].visuals.push(newVisual);

    // edit new visual in toolbox 
    this.editVisual(newVisual);

    // update grister-item with chartConfig positioning/size
    this.dashboards.forEach(value => value.visuals.forEach((visual: VisualConfigItem) => {
      const layerSetting = visual.Settings.find(setting => setting.Key === 'layerIndex').Value as number;
      
      visual.gridConfig = { x: visual.PosX, y: visual.PosY, cols: visual.Width, rows: visual.Heigth, collection: 'visuals', id: visual.VisualConfigId, layerIndex: layerSetting}
      }) 
    );
  }

  // get id of visual in edition
  get editingVisualId(): number {
    if(!this.dashboardService.visual$.value) { return 0 }
    
    const { VisualConfigId } = this.dashboardService.visual$.value;
    return VisualConfigId || 0;
  }

  /**
   * Snapshots
   */
  editSnapshot(snapshot: SnapshotConfigItem) {
    event.stopImmediatePropagation();
    
    // set chart in edition
    this.dashboardService.clearWidgetsEdition();
    this.dashboardService.snapshot$.next(snapshot);

    this.router.navigate(['/', { outlets: {toolbox: 'widget-toolbox'} } ])
  }

  deleteSnapshot(snapshot: SnapshotConfigItem) {
    event.stopImmediatePropagation();
    const itemDeleted: SnapshotConfigItem = this.dashboards[this.activeDashboard].snapshots.find((value: SnapshotConfigItem) => value.SnapShotConfigId === snapshot.SnapShotConfigId);

    itemDeleted.SnapShotConfigId < 0 
    ? this.dashboards[this.activeDashboard].snapshots.splice(this.dashboards[this.activeDashboard].snapshots.indexOf(itemDeleted), 1)
    : this.dashboardService.deleteSnapshot(itemDeleted)
        .subscribe(value => {
          console.log('removed snapshot', value)
          this.dashboards[this.activeDashboard].snapshots.splice(this.dashboards[this.activeDashboard].snapshots.indexOf(itemDeleted), 1);
          
          // close panel
          this.router.navigate(['/', { outlets: {toolbox: null} } ])
        })
  }

  // update snapshot config on server
  private updateSnapshot(snapshot: SnapshotConfigItem) {
  // ingore unsaved snapshot
  if(snapshot.SnapShotConfigId < 0) { return; }

  // update snapshot
  this.dashboardService.updateSnapshot(snapshot)
    .subscribe(value => {
      console.log(value)
    })
  }

  // specific drop snapshot handler
  private onDropSnapshot(snapshotType: number, emptyCellItem: GridsterItem) {
    const unsavedSnapshotId = this.dashboards[this.activeDashboard].snapshots.reduce((min, snapshot) => snapshot.SnapShotConfigId < min ? snapshot.SnapShotConfigId : min, 0)
    const newSnapshot: SnapshotConfigItem = Object.assign(new SnapshotConfigItem(), {
      SnapShotConfigId: unsavedSnapshotId - 1,
      SnapShotType: snapshotType,
      DashBoardId: this.dashboards[this.activeDashboard].Id,
      Name: 'new',
      PosX: emptyCellItem.x, PosY: emptyCellItem.y,
      Width: 6, Heigth: 4,    
    })

    this.dashboards[this.activeDashboard].snapshots.push(newSnapshot);

    // edit new snapshot in toolbox 
    this.editSnapshot(newSnapshot);

    // update grister-item with snapshotConfig positioning/size
    this.dashboards.forEach(value => value.snapshots.forEach((snapshot: SnapshotConfigItem) => {
      snapshot.gridConfig = { x: snapshot.PosX, y: snapshot.PosY, cols: snapshot.Width, rows: snapshot.Heigth, collection: 'snapshots', id: snapshot.SnapShotConfigId }
      }) 
    );
  }

  // get id of snapshot in edition
  get editingSnapshotId(): number {
    if(!this.dashboardService.snapshot$.value) { return 0 }
    
    const { SnapShotConfigId } = this.dashboardService.snapshot$.value;
    return SnapShotConfigId || 0;
  }

  // refresh widgets ConfigItems with grid positioning/size
  private refreshPositionFields() {
    // charts
    this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
      chart.PosX = chart.gridConfig.x;
      chart.PosY = chart.gridConfig.y;
      chart.Width = chart.gridConfig.cols;
      chart.Heigth = chart.gridConfig.rows;
    }));
    
    // visuals
    this.dashboards.forEach(value => value.visuals.forEach((visual:VisualConfigItem) => {
      visual.PosX = visual.gridConfig.x;
      visual.PosY = visual.gridConfig.y;
      visual.Width = visual.gridConfig.cols;
      visual.Heigth = visual.gridConfig.rows;
    }));

    // snapshots
    this.dashboards.forEach(value => value.snapshots.forEach((snapshot:SnapshotConfigItem) => {
      snapshot.PosX = snapshot.gridConfig.x;
      snapshot.PosY = snapshot.gridConfig.y;
      snapshot.Width = snapshot.gridConfig.cols;
      snapshot.Heigth = snapshot.gridConfig.rows;
    }));
  }


  // get the selected dasbhoard
  get activeDashboard(): number {
    return this.tabs.selectedIndex;
  }

  // on drop a new item into dashboard
  onDrop(ev, emptyCellItem: GridsterItem) {    
    if(!this.dashboards){ return }

    const { collection, type } = JSON.parse(ev.dataTransfer.getData("widgetConfig"));
    
    // drop chart
    if(collection === 'charts'){ return this.onDropChart(type, emptyCellItem) }

    // drop visual
    if(collection === 'visuals'){ return this.onDropVisual(type, emptyCellItem) }

    // drop snapshot
    if(collection === 'snapshots'){ return this.onDropSnapshot(type, emptyCellItem) }

  }

  get chartsCollection(): ChartConfigItem[] {
    return this.dashboards[this.activeDashboard].charts.filter(value => {
      if(!value.Settings) { return false }; // TODO - remove when chartConfig has Settings field
      const container = value.Settings.find(setting => setting.Key === 'visualContainer');
      return !container 
    })
  }

  get visualsCollection(): VisualConfigItem[] {
    return this.dashboards[this.activeDashboard].visuals.filter(value => {
      if(!value.Settings) { return false }; // TODO - remove when chartConfig has Settings field
      const container = value.Settings.find(setting => setting.Key === 'visualContainer');
      return !container 
    })
  }

  get snapshotsCollection(): SnapshotConfigItem[] {
    return this.dashboards[this.activeDashboard].snapshots.filter(value => {
      if(!value.Settings) { return false }; // TODO - remove when chartConfig has Settings field
      const container = value.Settings.find(setting => setting.Key === 'visualContainer');
      return !container 
    })
  }

} 

