import { Component, OnInit, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem, GridType }  from 'angular-gridster2';
import { Router } from '@angular/router';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ChartComponent } from 'src/app/shared/chart/chart.component';
import { DashboardService } from '../dashboard.service';

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

  constructor(
    private router: Router,
    private dashboardService: DashboardService) { }

  ngOnInit() {

    this.dashboard = [
      {cols: 2, rows: 1, y: 0, x: 0},
      {cols: 2, rows: 2, y: 0, x: 2}
    ];

    // setup dashboards 
    this.setupDashboards();
  }
  
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
      {... new DashboardItem(), title: 'Dash 1', charts: [chart1, chart2], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 2', charts: [chart3], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 3', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 4', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 5', charts: [], snapshots: [], visuals: []},

      {... new DashboardItem(), title: 'Dash 6', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 7', charts: [], snapshots: [], visuals: []},

      {... new DashboardItem(), title: 'Dash 8', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 9', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 10', charts: [], snapshots: [], visuals: []},
      {... new DashboardItem(), title: 'Dash 11', charts: [], snapshots: [], visuals: []},
    ];

    this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
      chart.gridConfig = { x: chart.posX, y: chart.posY, cols: chart.width, rows: chart.heigth }
      }) 
    )

  }


  itemChange(item, itemComponent) {
    //console.info('itemChanged', item, itemComponent);
    const itemChanged = this.dashboards[this.activeDashboard].charts.find((value: ChartConfigItem) => value.chartConfigId === +itemComponent.el.id);
    
    // TODO check types for rest of element types
    this.updateChartConfigs();

  }

  itemResize(item, itemComponent) {
    const itemChanged = this.dashboards[this.activeDashboard].charts.find((value: ChartConfigItem) => value.chartConfigId === +itemComponent.el.id);
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

    const itemDeleted = this.dashboards[this.activeDashboard].charts.find((value: ChartConfigItem) => value.chartConfigId === chart.chartConfigId);
    this.dashboards[this.activeDashboard].charts.splice(this.dashboards[this.activeDashboard].charts.indexOf(itemDeleted), 1);
    
  }

  // on drop a new item into dashboard
  onDrop(ev, emptyCellItem: GridsterItem) {    
    if(!this.dashboards){ return }
    // TODO check for all types of elements
    const chartType = ev.dataTransfer.getData("chartType");
    const newChart: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      chartConfigId: 3,
      chartType: chartType,
      description: 'new',
      posX: emptyCellItem.x, posY: emptyCellItem.y,
      width: 5, heigth: 5
    })
		this.dashboards[this.activeDashboard].charts.push(newChart);

    // edit new chart in toolbox 
    this.editChart(newChart);

    // update grister-item with chartConfig positioning/size
    return this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
      chart.gridConfig = { x: chart.posX, y: chart.posY, cols: chart.width, rows: chart.heigth }
      }) 
    );

	}

  // update chartConfig with grid positioning/size
  private updateChartConfigs() {
    this.dashboards.forEach(value => value.charts.forEach((chart:ChartConfigItem) => {
      chart.posX = chart.gridConfig.x;
      chart.posY = chart.gridConfig.y;
      chart.width = chart.gridConfig.cols;
      chart.heigth = chart.gridConfig.rows;
    }));
  }

  // get the selected dasbhoard
  get activeDashboard(): number {
    return this.tabs.selectedIndex;
  }

} 

