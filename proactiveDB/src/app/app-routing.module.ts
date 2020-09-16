import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MenuToolboxComponent } from './shared/toolbox/menu-toolbox/menu-toolbox.component';
import { DatasourceToolboxComponent } from './shared/toolbox/datasource-toolbox/datasource-toolbox.component';
import { TabToolboxComponent } from './shared/toolbox/tab-toolbox/tab-toolbox.component';
import { UserToolboxComponent } from './shared/toolbox/user-toolbox/user-toolbox.component';
import { AddChartToolboxComponent } from './shared/toolbox/add-chart-toolbox/add-chart-toolbox.component';
import { AddVisualToolboxComponent } from './shared/toolbox/add-visual-toolbox/add-visual-toolbox.component';
import { ChartToolboxComponent } from './shared/toolbox/chart-toolbox/chart-toolbox.component';
import { WidgetToolboxComponent } from './shared/toolbox/widget-toolbox/widget-toolbox.component';


const routes: Routes = [
  { 
    path: 'menu-toolbox',
    component: MenuToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'datasource-toolbox',
    component: DatasourceToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'tab-toolbox',
    component: TabToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'user-toolbox',
    component: UserToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'add-chart-toolbox',
    component: AddChartToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'add-visual-toolbox',
    component: AddVisualToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'chart-toolbox',
    component: ChartToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'widget-toolbox',
    component: WidgetToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
