import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { SystemService } from 'src/app/core/system.service';

@Component({
  selector: 'app-datasource-toolbox',
  templateUrl: './datasource-toolbox.component.html',
  styleUrls: ['./datasource-toolbox.component.scss']
})
export class DatasourceToolboxComponent implements OnInit, OnDestroy {

  availableDatasources: DataSourceItem[] = [];
  fieldsInUse: number[] = [];

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private systemService: SystemService) { }

  ngOnInit() {
    this.systemService.dataSources$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((value: DataSourceItem[]) => {
        /*// dont use fields
        this.availableDatasources = value
          .map(value => ({ 
            ...value, 
            itens: value.itens.map(itens => ({...itens, itens: []}) as DataSourceItem)
            } as DataSourceItem)
          ); */

        this.availableDatasources = value;

        // which tables are in use
        this.availableDatasources.forEach(db => {
          db.itens.forEach(table => {
            const fieldsInUse  = table.itens.filter(field => field.selected).map(value => value.MetadataEntryId)
            this.fieldsInUse.push(...fieldsInUse);
          })        
        })
      
      })
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  save() {
    console.log(this.fieldsInUse)
  }

}
