import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../auth/auth.guard';
import { MenuToolboxComponent } from '../shared/toolbox/menu-toolbox/menu-toolbox.component';
import { TabToolboxComponent } from '../shared/toolbox/tab-toolbox/tab-toolbox.component';
import { DatasourceToolboxComponent } from '../shared/toolbox/datasource-toolbox/datasource-toolbox.component';


const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
