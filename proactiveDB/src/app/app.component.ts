import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({ width: '*', visibility: '*' })),
      state('false', style({ width: '0px', visibility: 'hidden'  })),
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

