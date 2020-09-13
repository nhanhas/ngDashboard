import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({   display: '*' })),
      state('false', style({  display: 'none'  })),
      transition('false <=> true', animate(100))
    ])
  ],
})
export class AppComponent implements OnInit {
  title = 'proactiveDB';
  
  toolboxOpened: boolean;

  constructor() { }

  ngOnInit() {    
  }

}
