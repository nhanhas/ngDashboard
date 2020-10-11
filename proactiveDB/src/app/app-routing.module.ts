import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DatasourceToolboxComponent } from './shared/toolbox/datasource-toolbox/datasource-toolbox.component';
import { FilterToolboxComponent } from './shared/toolbox/filter-toolbox/filter-toolbox.component';
import { TabToolboxComponent } from './shared/toolbox/tab-toolbox/tab-toolbox.component';
import { WidgetToolboxComponent } from './shared/toolbox/widget-toolbox/widget-toolbox.component';


const routes: Routes = [
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
    path: 'widget-toolbox',
    component: WidgetToolboxComponent,
    outlet: 'toolbox'
  },
  { 
    path: 'filter-toolbox',
    component: FilterToolboxComponent,
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
