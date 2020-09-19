import { GridsterItem } from 'angular-gridster2';

export class ChartConfigItem {

  ChartConfigId: number = 0;
  Name: string = '';
  Description: string = '';
  ChartSetId: number  = 0;
  ChartType: string = '';
  BackGroundColor: string = '';
  Color: string = '';
  PosX: number  = 0;
  PosY: number  = 0;
  Width: number  = 0;
  Heigth: number  = 0;
  Fields = [];
  Settings = [];
  XAxisMetadataEntry: number  = 0;
  RMetadataEntry: number  = 0;

  gridConfig: GridsterItem;

}