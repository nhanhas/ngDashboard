import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ChartConfigItem } from 'src/app/core/models/ChartConfigItem';

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

  constructor() { }

  ngOnInit() {
    // load from server
  }

  private setupChart(result) {
    switch (this.chart.ChartType) {
      case 'line':
        this.lineSetup(result);
        break;

      case 'bar':
        this.barSetup(result);
        break;

      case 'pie':
        this.pieSetup(result);
        break;  

      default:
        // never hit this!
        this.lineSetup(result);
        break;  
    }
  }

  private lineSetup(result) {

  }

  private barSetup(result) {

  }

  private pieSetup(result) {

  }



}
