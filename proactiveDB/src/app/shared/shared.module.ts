import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MenuComponent } from './menu/menu.component';
import { TabToolboxComponent } from './toolbox/tab-toolbox/tab-toolbox.component';
import { DatasourceToolboxComponent } from './toolbox/datasource-toolbox/datasource-toolbox.component';
import { RouterModule } from '@angular/router';
import { GridsterModule } from 'angular-gridster2';
import { ChartComponent } from './chart/chart.component';
import { ChartsModule } from 'ng2-charts';
import { AdsenseComponent } from './adsense/adsense.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserInfoComponent } from './user-info/user-info.component';
import { WidgetToolboxComponent } from './toolbox/widget-toolbox/widget-toolbox.component';
import { DatasourceTreeComponent } from './datasource-tree/datasource-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatasetPickerComponent } from './dataset-picker/dataset-picker.component';
import { FilterToolboxComponent } from './toolbox/filter-toolbox/filter-toolbox.component';
import { VisualComponent } from './visual/visual.component';
import { VisualContainerComponent } from './visual/visual-container/visual-container.component';





@NgModule({
  declarations: [MenuComponent, 
    TabToolboxComponent, 
    DatasourceToolboxComponent, 
    ChartComponent, 
    AdsenseComponent, 
    UserInfoComponent, 
    WidgetToolboxComponent, 
    DatasourceTreeComponent, 
    DatasetPickerComponent, 
    FilterToolboxComponent, 
    VisualComponent, 
    VisualContainerComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule,
    GridsterModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    MaterialModule,
    FlexLayoutModule,
    MenuComponent,
    GridsterModule,
    ChartsModule,
    ChartComponent,
    AdsenseComponent,
    FormsModule,
    ReactiveFormsModule,
    UserInfoComponent,
    VisualComponent,
    VisualContainerComponent
  ]
})
export class SharedModule { }
