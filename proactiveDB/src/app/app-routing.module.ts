import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MenuToolboxComponent } from './shared/toolbox/menu-toolbox/menu-toolbox.component';
import { DatasourceToolboxComponent } from './shared/toolbox/datasource-toolbox/datasource-toolbox.component';
import { TabToolboxComponent } from './shared/toolbox/tab-toolbox/tab-toolbox.component';


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
