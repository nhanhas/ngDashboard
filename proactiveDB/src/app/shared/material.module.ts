import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';




@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatTabsModule,
    MatSidenavModule,
    MatIconModule,
  ],
  exports: [
    MatTabsModule,
    MatSidenavModule,
    MatIconModule
  ]
})
export class MaterialModule { }
