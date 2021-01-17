import { GridsterItem } from "angular-gridster2";

export class SnapshotConfigItem{

  Id: number
  SnapShotConfigId: number;
  Name: string = '';
  Description: string = '';
  DashBoardId: number;
  SnapShotType: number;
  BackgroundColor: string = '';
  Color: string = '';
  PosX: number;
  PosY: number;
  Width: number;
  Heigth: number;
  Fields = [];
  Settings: {Key: {}, Value: {}} [] = [];

  gridConfig: GridsterItem;
}