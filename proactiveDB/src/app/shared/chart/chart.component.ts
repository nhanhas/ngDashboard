import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @Input() chart: ChartConfigItem;

  chartData: ChartDataSets[] = [
    { data: [85, 72, 78, 75, 77, 75], label: 'Crude oil prices' },
  ];

  chartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June'];

  chartOptions = {
    responsive: true,
  };

  chartColors: Color[] = [
    /*{
      borderColor: 'black',
      backgroundColor: 'rgba(255,255,0,0.28)',
    },*/
  ];

  chartLegend = true;
  chartPlugins = [];

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private dashboardService: DashboardService) { }

  ngOnInit() {
 
    this.dashboardService.reloadData$
      .pipe(
        takeUntil(this.destroy$),
        
        filter((value: number) => this.chart.ChartConfigId === value)
      )      
      .subscribe(_ => this.loadChartResults())

    // load results
    this.loadChartResults();
  }

  private loadChartResults() {
    if(this.chart.ChartConfigId < 0) { return }
    
    // load from server
    const endDate = new Date();
    const startDate = new Date() 
    startDate.setMonth(endDate.getMonth() - 6);
    
    this.dashboardService.loadChartResults(this.chart.ChartConfigId, startDate, endDate)
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

  



}
