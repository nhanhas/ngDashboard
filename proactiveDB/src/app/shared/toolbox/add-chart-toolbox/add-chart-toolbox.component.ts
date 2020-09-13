import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-chart-toolbox',
  templateUrl: './add-chart-toolbox.component.html',
  styleUrls: ['./add-chart-toolbox.component.scss']
})
export class AddChartToolboxComponent implements OnInit {

  chartTypes: any[] = [];

  constructor() { }

  ngOnInit() {

    // TODO - load chart types from api
    this.chartTypes = [
      { chartType: 'line'},
      { chartType: 'bar'},
      { chartType: 'pie'},
      { chartType: 'radar'},
      { chartType: 'polar'},
      { chartType: 'bubble' }
    ]

  }

  onDrag(event, identifier) {
		event.dataTransfer.setData('chartType', identifier);
	}

}
