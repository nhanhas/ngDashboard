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
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { VisualConfigItem } from 'src/app/core/models/VisualConfigItem';
import { SystemService } from 'src/app/core/system.service';

export interface DashboardConfig {
  charts: []
}

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

          // TODO - add more items here to load and then , forkJoin
          return forkJoin([...charts])
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

        this.ready = true;
      })

    // setup dashboards 
    //this.setupDashboards();
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
    if(collection === 'snapshots') { idField = 'SnapshotConfigId' };
    if(collection === 'visuals') { idField = 'VisualConfigId' };
    
    // refresh model positions before update on server
    this.refreshPositionFields();

    // get item changed
    const itemChanged = this.dashboards[this.activeDashboard][collection].find(value => value[idField] === +id);
    
    // chart update
    if(itemChanged instanceof ChartConfigItem) { this.updateChart(itemChanged) }
    
    // snapshot update - TODO

    // visual update
    if(itemChanged instanceof VisualConfigItem) { this.updateVisual(itemChanged) }

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
    const itemDeleted = this.dashboards[this.activeDashboard].charts.find((value: ChartConfigItem) => value.ChartConfigId === chart.ChartConfigId);

    this.dashboardService.deleteChart(itemDeleted)
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
    this.dashboardService.updateChart(chart)
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
    const itemDeleted = this.dashboards[this.activeDashboard].visuals.find((value: VisualConfigItem) => value.VisualConfigId === visual.VisualConfigId);
    this.dashboards[this.activeDashboard].visuals.splice(this.dashboards[this.activeDashboard].visuals.indexOf(itemDeleted), 1);
        
    // close panel
    this.router.navigate(['/', { outlets: {toolbox: null} } ])
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
      Settings: [ {key: 'layerIndex', value: visualType === 1 ? 1 : 2} ]  
    })

    this.dashboards[this.activeDashboard].visuals.push(newVisual);

    // edit new visual in toolbox 
    this.editVisual(newVisual);

    // update grister-item with chartConfig positioning/size
    this.dashboards.forEach(value => value.visuals.forEach((visual: VisualConfigItem) => {
      const layerSetting = visual.Settings.find(setting => setting.key === 'layerIndex').value as number;
      
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

  // refresh widgets ConfigItems with grid positioning/size
  private refreshPositionFields() {
    // charts
    this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
      chart.PosX = chart.gridConfig.x;
      chart.PosY = chart.gridConfig.y;
      chart.Width = chart.gridConfig.cols;
      chart.Heigth = chart.gridConfig.rows;
    }));

    // snapshots - TODO
    

    // visuals - TODO
    this.dashboards.forEach(value => value.visuals.forEach((visual:VisualConfigItem) => {
      visual.PosX = visual.gridConfig.x;
      visual.PosY = visual.gridConfig.y;
      visual.Width = visual.gridConfig.cols;
      visual.Heigth = visual.gridConfig.rows;
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

    // drop snapshot - TODO

    // drop visual - TODO
    if(collection === 'visuals'){ return this.onDropVisual(type, emptyCellItem) }

  }

} 

