import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';





@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatTabsModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatExpansionModule,
    MatMenuModule,
    MatButtonModule
  ],
  exports: [
    MatTabsModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatExpansionModule,
    MatMenuModule,
    MatButtonModule
  ]
})
export class MaterialModule { }
