import { GridsterItem } from 'angular-gridster2';

export class VisualConfigItem {

  Id: number;
  DashBoardId: number;
  Name: string = '';
  Settings: {key: {}, value: {}} [];
  VisualConfigId: number;
  BackGroundColor: string = '';
  Color: string = '';
  Description: string = '';
  VisualType: number;
  PosX: number;
  PosY: number;
  Width: number;
  Heigth: number;

  gridConfig: GridsterItem;

}

