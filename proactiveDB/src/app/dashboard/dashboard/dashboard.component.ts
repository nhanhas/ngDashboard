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
  };

  dashboard: GridsterItem[] = [];

  // dashboard from server
  dashboards: DashboardItem[] = [];

  ready: boolean;

  constructor(
    private router: Router,
    private dashboardService: DashboardService) { }

  ngOnInit() {

    this.dashboard = [
      {cols: 2, rows: 1, y: 0, x: 0},
      {cols: 2, rows: 2, y: 0, x: 2}
    ];

    // load dashboards
    this.loadDashboards()
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
          chart.gridConfig = { x: chart.PosX, y: chart.PosY, cols: chart.Width, rows: chart.Heigth, collection: 'charts', id: chart.ChartConfigId }
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
    
    // refresh model positions before update on server
    this.refreshPositionFields();

    // get item changed
    const itemChanged = this.dashboards[this.activeDashboard][collection].find(value => value[idField] === +id);
    
    // chart update
    if(itemChanged instanceof ChartConfigItem) { this.updateChart(itemChanged) }
    
    // snapshot update - TODO

    // visual update - TODO

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
  editDashboard(id: number) {
    console.log('editing tab', id);
    // TODO - Toolbox service with object
    this.router.navigate(['/', { outlets: {toolbox: 'tab-toolbox'} } ])
  }

  /**
   * Chart
   */
  editChart(chart: ChartConfigItem) {
    event.stopImmediatePropagation();
    
    // set chart in edition
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

  }

} 

