import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MenuComponent } from './menu/menu.component';
import { MenuToolboxComponent } from './toolbox/menu-toolbox/menu-toolbox.component';
import { TabToolboxComponent } from './toolbox/tab-toolbox/tab-toolbox.component';
import { DatasourceToolboxComponent } from './toolbox/datasource-toolbox/datasource-toolbox.component';
import { RouterModule } from '@angular/router';
import { GridsterModule } from 'angular-gridster2';
import { UserToolboxComponent } from './toolbox/user-toolbox/user-toolbox.component';
import { AddChartToolboxComponent } from './toolbox/add-chart-toolbox/add-chart-toolbox.component';
import { AddVisualToolboxComponent } from './toolbox/add-visual-toolbox/add-visual-toolbox.component';
import { ChartComponent } from './chart/chart.component';
import { ChartsModule } from 'ng2-charts';
import { ChartToolboxComponent } from './toolbox/chart-toolbox/chart-toolbox.component';





@NgModule({
  declarations: [MenuComponent, MenuToolboxComponent, TabToolboxComponent, DatasourceToolboxComponent, UserToolboxComponent, AddChartToolboxComponent, AddVisualToolboxComponent, ChartComponent, ChartToolboxComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule,
    GridsterModule,
    ChartsModule
  ],
  exports: [
    MaterialModule,
    FlexLayoutModule,
    MenuComponent,
    GridsterModule,
    ChartsModule,
    ChartComponent
  ]
})
export class SharedModule { }
