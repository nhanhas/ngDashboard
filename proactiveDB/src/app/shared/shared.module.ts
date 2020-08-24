import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MenuComponent } from './menu/menu.component';
import { MenuToolboxComponent } from './toolbox/menu-toolbox/menu-toolbox.component';
import { TabToolboxComponent } from './toolbox/tab-toolbox/tab-toolbox.component';
import { DatasourceToolboxComponent } from './toolbox/datasource-toolbox/datasource-toolbox.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [MenuComponent, MenuToolboxComponent, TabToolboxComponent, DatasourceToolboxComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule
  ],
  exports: [
    MaterialModule,
    FlexLayoutModule,
    MenuComponent
  ]
})
export class SharedModule { }
