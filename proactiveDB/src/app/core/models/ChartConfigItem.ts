import { GridsterItem } from 'angular-gridster2';

export class ChartConfigItem {

  chartConfigId: number = 0;
  name: string = '';
  description: string = '';
  chartSetId: number  = 0;
  chartType: string = '';
  backgroundColor: string = '';
  color: string = '';
  posX: number  = 0;
  posY: number  = 0;
  width: number  = 0;
  heigth: number  = 0;
  fields = [];
  settings = [];
  XAxisMetadataEntry: number  = 0;
  RMetadataEntry: number  = 0;

  gridConfig: GridsterItem;

}