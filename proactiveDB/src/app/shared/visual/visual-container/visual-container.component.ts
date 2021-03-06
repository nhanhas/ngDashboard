import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridsterConfig, GridType, GridsterItem } from 'angular-gridster2';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { SnapshotConfigItem } from 'src/app/core/models/SnapshotConfigItem';
import { VisualConfigItem } from 'src/app/core/models/VisualConfigItem';
import { SystemService } from 'src/app/core/system.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-visual-container',
  templateUrl: './visual-container.component.html',
  styleUrls: ['./visual-container.component.scss']
})
export class VisualContainerComponent implements OnInit {  
  @Input() visual: VisualConfigItem;
  @Input() dashboardItem: DashboardItem;
  
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

  constructor(
    private router: Router,
    private systemService: SystemService,
    private dashboardService: DashboardService) { }

  ngOnInit() {    
    this.options.defaultLayerIndex = +this.layerSetting+1;
  }
  
  /**
   * Chart
   */
  // specific drop chart handler
  private onDropChart(chartType: string, emptyCellItem: GridsterItem) {
    const unsavedChartId = this.dashboardItem.charts.reduce((min, chart) => chart.ChartConfigId < min ? chart.ChartConfigId : min, 0)
    const newChart: ChartConfigItem = Object.assign(new ChartConfigItem(), {
      ChartConfigId: unsavedChartId - 1,
      ChartType: chartType,
      ChartSetId: this.dashboardItem.Id,
      Name: 'new',
      PosX: emptyCellItem.x, PosY: emptyCellItem.y,
      Width: 6, Heigth: 4,
      Settings: [{
        Key: 'visualContainer',
        Value: this.visual.VisualConfigId
      }]      
    })

    this.dashboardItem.charts.push(newChart);

    // edit new chart in toolbox 
    this.editChart(newChart);

    // update grister-item with chartConfig positioning/size
    this.dashboardItem.charts.forEach((chart:ChartConfigItem) => {
      chart.gridConfig = { x: chart.PosX, y: chart.PosY, cols: chart.Width, rows: chart.Heigth, collection: 'charts', id: chart.ChartConfigId }
    });    
  }
 
  editChart(chart: ChartConfigItem) {
    event.stopImmediatePropagation();
    
    // set chart in edition
    this.dashboardService.clearWidgetsEdition();
    this.dashboardService.chart$.next(chart);

    this.router.navigate(['/', { outlets: {toolbox: 'widget-toolbox'} } ])
  }

  deleteChart(chart: ChartConfigItem) {
    event.stopImmediatePropagation();
  
    const itemDeleted: ChartConfigItem = this.dashboardItem.charts.find((value: ChartConfigItem) => value.ChartConfigId === chart.ChartConfigId);

    itemDeleted.ChartConfigId < 0 
    ? this.dashboardItem.charts.splice(this.dashboardItem.charts.indexOf(itemDeleted), 1)
    : this.dashboardService.deleteChart(itemDeleted)
        .subscribe(value => {
          console.log('removed chart', value)
          this.dashboardItem.charts.splice(this.dashboardItem.charts.indexOf(itemDeleted), 1);
          
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

  /**
   * Visuals
   */
  // specific drop visual handler
  private onDropVisual(visualType: number, emptyCellItem: GridsterItem) {
    const unsavedVisualId = this.dashboardItem.visuals.reduce((min, visual) => visual.VisualConfigId < min ? visual.VisualConfigId : min, 0)
    const newVisual: VisualConfigItem = Object.assign(new VisualConfigItem(), {
      VisualConfigId: unsavedVisualId - 1,
      VisualType: visualType,
      DashBoardId: this.dashboardItem.Id,
      Name: 'new',
      PosX: emptyCellItem.x, PosY: emptyCellItem.y,
      Width: 2, Heigth: 2,    
      Settings: [ 
        {Key: 'layerIndex', Value: visualType === 1 ? (+this.layerSetting + 1)  : (+this.layerSetting + 2)} ,
        {Key: 'visualContainer', Value: this.visual.VisualConfigId}

      ]  
    })
    this.dashboardItem.visuals.push(newVisual);

    // edit new visual in toolbox 
    this.editVisual(newVisual);

    // update grister-item with chartConfig positioning/size
    this.dashboardItem.visuals.forEach((visual: VisualConfigItem) => {
      const layerSetting = visual.Settings.find(setting => setting.Key === 'layerIndex').Value as number;
      
      visual.gridConfig = { x: visual.PosX, y: visual.PosY, cols: visual.Width, rows: visual.Heigth, collection: 'visuals', id: visual.VisualConfigId, layerIndex: layerSetting } 
    });
  }

  editVisual(visual: VisualConfigItem) {
    event.stopImmediatePropagation();
    
    // set chart in edition
    this.dashboardService.clearWidgetsEdition();
    this.dashboardService.visual$.next(visual);

    this.router.navigate(['/', { outlets: {toolbox: 'widget-toolbox'} } ])
  }

  deleteVisual(visual: VisualConfigItem) {
    event.stopImmediatePropagation();
    const itemDeleted: VisualConfigItem = this.dashboardItem.visuals.find((value: VisualConfigItem) => value.VisualConfigId === visual.VisualConfigId);

    itemDeleted.VisualConfigId < 0 
    ? this.dashboardItem.charts.splice(this.dashboardItem.charts.indexOf(itemDeleted), 1)
    : this.dashboardService.deleteVisual(itemDeleted)
        .subscribe(value => {
          console.log('removed visual', value)
          this.dashboardItem.visuals.splice(this.dashboardItem.visuals.indexOf(itemDeleted), 1);
          
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
    const itemDeleted: SnapshotConfigItem = this.dashboardItem.snapshots.find((value: SnapshotConfigItem) => value.SnapShotConfigId === snapshot.SnapShotConfigId);

    itemDeleted.SnapShotConfigId < 0 
    ? this.dashboardItem.snapshots.splice(this.dashboardItem.snapshots.indexOf(itemDeleted), 1)
    : this.dashboardService.deleteSnapshot(itemDeleted)
        .subscribe(value => {
          console.log('removed snapshot', value)
          this.dashboardItem.snapshots.splice(this.dashboardItem.snapshots.indexOf(itemDeleted), 1);
          
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
    const unsavedSnapshotId = this.dashboardItem.snapshots.reduce((min, snapshot) => snapshot.SnapShotConfigId < min ? snapshot.SnapShotConfigId : min, 0)
    const newSnapshot: SnapshotConfigItem = Object.assign(new SnapshotConfigItem(), {
      SnapShotConfigId: unsavedSnapshotId - 1,
      SnapShotType: snapshotType,
      DashBoardId: this.dashboardItem.Id,
      Name: 'new',
      PosX: emptyCellItem.x, PosY: emptyCellItem.y,
      Width: 6, Heigth: 4,    
      Settings: [ {
        Key: 'visualContainer',
        Value: this.visual.VisualConfigId
      }]  
    })

    this.dashboardItem.snapshots.push(newSnapshot);

    // edit new snapshot in toolbox 
    this.editSnapshot(newSnapshot);

    // update grister-item with snapshotConfig positioning/size
    this.dashboardItem.snapshots.forEach((snapshot:SnapshotConfigItem) => {
      snapshot.gridConfig = { x: snapshot.PosX, y: snapshot.PosY, cols: snapshot.Width, rows: snapshot.Heigth, collection: 'snapshots', id: snapshot.SnapShotConfigId }
    });  
  }

  // get id of snapshot in edition
  get editingSnapshotId(): number {
    if(!this.dashboardService.snapshot$.value) { return 0 }
    
    const { SnapShotConfigId } = this.dashboardService.snapshot$.value;
    return SnapShotConfigId || 0;
  }


  // on drop a new item into dashboard
  onDrop(ev, emptyCellItem: GridsterItem) {    
    event.stopPropagation();
    const { collection, type } = JSON.parse(ev.dataTransfer.getData("widgetConfig"));
    
    // drop chart
    if(collection === 'charts'){ return this.onDropChart(type, emptyCellItem) }

    // drop snapshot
    if(collection === 'snapshots'){ return this.onDropSnapshot(type, emptyCellItem) }

    // drop visual
    if(collection === 'visuals'){ return this.onDropVisual(type, emptyCellItem) }

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
    const itemChanged = this.dashboardItem[collection].find(value => value[idField] === +id);
    
    // chart update
    if(itemChanged instanceof ChartConfigItem) { this.updateChart(itemChanged) }
    
    // snapshot update
    if(itemChanged instanceof SnapshotConfigItem) { this.updateSnapshot(itemChanged) }

    // visual update
    if(itemChanged instanceof VisualConfigItem) { this.updateVisual(itemChanged) }

    console.log('changed widget dimensions', itemChanged);
  }

  itemResize(item, itemComponent) {
    //const itemChanged = this.dashboard[this.activeDashboard].charts.find((value: ChartConfigItem) => value.ChartConfigId === +itemComponent.el.id);
  }

  // refresh widgets ConfigItems with grid positioning/size
  private refreshPositionFields() {
    // charts
    this.dashboardItem.charts.forEach((chart:ChartConfigItem) => {
      chart.PosX = chart.gridConfig.x;
      chart.PosY = chart.gridConfig.y;
      chart.Width = chart.gridConfig.cols;
      chart.Heigth = chart.gridConfig.rows;
    });

    // snapshots
    this.dashboardItem.snapshots.forEach((snapshot:SnapshotConfigItem) => {
      snapshot.PosX = snapshot.gridConfig.x;
      snapshot.PosY = snapshot.gridConfig.y;
      snapshot.Width = snapshot.gridConfig.cols;
      snapshot.Heigth = snapshot.gridConfig.rows;
    });
    
    // visuals
    this.dashboardItem.visuals.forEach((visual:VisualConfigItem) => {
      visual.PosX = visual.gridConfig.x;
      visual.PosY = visual.gridConfig.y;
      visual.Width = visual.gridConfig.cols;
      visual.Heigth = visual.gridConfig.rows;
    });   
  }

  // get id of visual in edition
  get editingVisualId(): number {
    if(!this.dashboardService.visual$.value) { return 0 }
    
    const { VisualConfigId } = this.dashboardService.visual$.value;
    return VisualConfigId || 0;
  }

  // get id of chart in edition
  get editingChartId(): number {
    if(!this.dashboardService.chart$.value) { return 0 }
    
    const { ChartConfigId } = this.dashboardService.chart$.value;
    return ChartConfigId || 0;
  }

  get layerSetting(): number {
    return this.visual.Settings.find(setting => setting.Key === 'layerIndex').Value as number;
  }

  get chartsCollection(): ChartConfigItem[] {
    return this.dashboardItem.charts.filter(value => {
      if(!value.Settings) { return false }; // TODO - remove when chartConfig has Settings field
      const container = value.Settings.find(setting => setting.Key === 'visualContainer');
      return container 
        ? +container.Value === this.visual.VisualConfigId
        : false;
    })
  }

  get visualsCollection(): VisualConfigItem[] {
    return this.dashboardItem.visuals.filter(value => {
      if(!value.Settings) { return false }; // TODO - remove when chartConfig has Settings field
      const container = value.Settings.find(setting => setting.Key === 'visualContainer');
      return container 
        ? +container.Value === this.visual.VisualConfigId
        : false;
    })
  }

  get snapshotsCollection(): ChartConfigItem[] {
    return this.dashboardItem.snapshots.filter(value => {
      if(!value.Settings) { return false }; // TODO - remove when chartConfig has Settings field
      const container = value.Settings.find(setting => setting.Key === 'visualContainer');
      return container 
        ? +container.Value === this.visual.VisualConfigId
        : false;
    })
  }

}
