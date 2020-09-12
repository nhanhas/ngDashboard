import { Component, OnInit, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem, GridType }  from 'angular-gridster2';
import { Router } from '@angular/router';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

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

  options: GridsterConfig;
  dashboard: GridsterItem[] = [];

  // dashboard from server
  dashboards: DashboardItem[] = [];

  constructor(
    private router: Router) { }

  ngOnInit() {
    this.options = {
      gridType: GridType.Fixed,
      draggable: {
        enabled: true,
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
      posX: 0, posY: 0,
      width: 10, heigth: 6
    })

    const chart2: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      chartConfigId: 2,
      description: 'chart 2',
      posX: 4, posY: 6,
      width: 10, heigth: 6
    })

    const chart3: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      chartConfigId: 3,
      description: 'chart 3',
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
    event.stopPropagation();
    // TODO - Toolbox service with object
    this.router.navigate(['/', { outlets: {toolbox: 'chart-toolbox'} } ])
  }

  deleteChart(chart: ChartConfigItem) {
    event.stopPropagation();
  }


  // get the selected dasbhoard
  get activeDashboard(): number {
    return this.tabs.selectedIndex;
  }

} 

