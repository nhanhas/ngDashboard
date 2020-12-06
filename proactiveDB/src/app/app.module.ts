import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthService } from './auth/auth.service';
import { SystemService } from './core/system.service';
import { HttpClientModule } from '@angular/common/http';

import 'hammerjs';
import 'chartjs-plugin-zoom';

// start app system
export function start(systemService: SystemService, authService: AuthService) {
  return () => systemService.start(authService);
}

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    AuthModule,
    DashboardModule,    
    AppRoutingModule,
  ],
  providers: [
    { 
      provide: APP_INITIALIZER, 
      useFactory: start, 
      deps: [SystemService, AuthService], 
      multi: true 
    },   
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
