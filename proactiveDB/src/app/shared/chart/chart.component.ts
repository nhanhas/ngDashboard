import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Subject } from 'rxjs';
import { filter, finalize, takeUntil, tap } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { SystemService } from 'src/app/core/system.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { DashboardConfig } from 'src/app/dashboard/dashboard/dashboard.component';
import * as zoomPlugin from 'chartjs-plugin-zoom';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @Input() chart: ChartConfigItem;

  // development
  chartData: ChartDataSets[] = [
    { data: [], label: '' },
  ];
  chartLabels: Label[] = []; 
  

  //chartData: ChartDataSets[] = [];
  //chartLabels: Label[] = [];

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    pan: {
      enabled: true,
      mode: 'xy',
      rangeMin: {
        // Format of min pan range depends on scale type
        x: null,
        y: null
      },
      rangeMax: {
        // Format of max pan range depends on scale type
        x: null,
        y: null
      },
      // Function called once panning is completed
      // Useful for dynamic data loading
      onPan: function (e) { }
    },
    zoom: {
      enabled: true,
      drag: false,

      // Drag-to-zoom rectangle style can be customized
      // drag: {
      // 	 borderColor: 'rgba(225,225,225,0.3)'
      // 	 borderWidth: 5,
      // 	 backgroundColor: 'rgb(225,225,225)'
      // },

      // Zooming directions. Remove the appropriate direction to disable
      // Eg. 'y' would only allow zooming in the y direction
      mode: 'xy',

      rangeMin: {
        // Format of min zoom range depends on scale type
        x: null,
        y: null
      },
      rangeMax: {
        // Format of max zoom range depends on scale type
        x: null,
        y: null
      },

      // Speed of zoom via mouse wheel
      // (percentage of zoom on a wheel event)
      speed: 0.1,

      // Function called once zooming is completed
      // Useful for dynamic data loading
      onZoom: function ({ chart }) {  }
    }
    
  };

  chartColors: Color[] = [
    /*{
      borderColor: 'black',
      backgroundColor: 'rgba(255,255,0,0.28)',
    },*/
  ];

  chartLegend = true;
  chartPlugins = [
    zoomPlugin    
  ];

  loading: boolean;

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private systemService: SystemService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
 
    this.dashboardService.reloadData$
      .pipe(
        takeUntil(this.destroy$),

        filter((value: number) => this.chart.ChartConfigId === value),

        tap(_ => this.loading = true),

        finalize(() => this.loading = false)
      )      
      .subscribe(_ => this.loadChartResults())

    // load results
    this.loadChartResults();
  }

  private loadChartResults() {
    if(this.chart.ChartConfigId < 0) { return }
    this.loading = true;
    
    // load from server
    const datesFilter: { startDate: Date, endDate: Date } = this.dashboardDateFilters;
    const endDate = datesFilter.endDate
    const startDate = datesFilter.startDate
        
    this.dashboardService.loadChartResults(this.chart.ChartConfigId, startDate, endDate)
    .pipe(           
      finalize(() => this.loading = false)
    )
    .subscribe(value => {
      // setup chart results
      this.setupChart(value);
    })
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();

    // clear widget in edition
    this.dashboardService.clearWidgetsEdition();
  }

  private setupChart(result) {
    switch (this.chart.ChartType) {
      case 'line':
      case 'bar':
        this.barSetup(result);
        break;

      case 'pie':
      case 'polar':
        this.pieSetup(result);
        break;  
      case 'radar':
        this.radarSetup(result);
        break;  

      default:
        // never hit this!
        this.barSetup(result);
        break;  
    }
  }

  private lineSetup(result) {

  }

  private barSetup(result) {
    this.chartLabels = result.labels;
    this.chartData = result.datasets;
  }

  private pieSetup(result) {
    this.chartLabels = result.labels;
    this.chartData = result.datasets;
  }

  private radarSetup(result) {
    let json = {
      "labels": [
        "sbsi"
      ],
      "datasets": [
        {
          "label": "created_workers_count",
          "data": [
            '180',
            '114'
          ]
        },
        {
          "label": "idle_workers_count",
          "data": [
            '64',
            '112'
          ]
        },
        {
          "label": "active_workers_count",
          "data": [
            '116',
            '51'
          ]
        }
      ]
    }
    
    this.chartLabels =  ['sb9s', 'asdv', 'add'];
    this.chartData = json['datasets'] as ChartDataSets[]; 

    console.log(this.chartData)
  }

  get dashboardDateFilters(): { startDate: Date, endDate: Date } {
    const dashboardId = this.chart.ChartSetId;
    
    const dashboardConfig = this.systemService.dashboards$.value.find((value: DashboardItem) => value.Id === dashboardId);

    const startDateFilter = dashboardConfig.Settings.find((setting: {Key: string, Value: string}) => setting.Key === 'startDateFilter');
    const endDateFilter = dashboardConfig.Settings.find((setting: {Key: string, Value: string}) => setting.Key === 'endDateFilter');

    // in case of no dates or wrong ones
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 6);
    
    return !!startDateFilter && !!endDateFilter 
      ? { startDate: startDateFilter.Value, endDate: endDateFilter.Value }
      : { startDate: start, endDate: end }

  }



}
