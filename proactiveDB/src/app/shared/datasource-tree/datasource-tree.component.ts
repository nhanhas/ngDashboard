import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { SelectionModel } from '@angular/cdk/collections';
import { from, of, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { takeUntil, debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { DashboardItem } from 'src/app/core/models/DashboardItem';

@Component({
  selector: 'app-datasource-tree',
  templateUrl: './datasource-tree.component.html',
  styleUrls: ['./datasource-tree.component.scss']
})
export class DatasourceTreeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() datasourceItems: DataSourceItem[];
  @Input() showFields: boolean;

  @Output() datasourceItemsChange = new EventEmitter<DataSourceItem[]>();
  

  filterTerm = new FormControl();
  filtredData: DataSourceItem[] = [];

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const datasourceItems = changes['datasourceItems']?.currentValue
    if(datasourceItems) {
      this.refresh();
    }    
  }

  ngOnInit() {
     // filter term
     this.filterTerm.valueChanges
     .pipe(

       takeUntil(this.destroy$),

       // wait 300ms after each keystroke before considering the term
       debounceTime(300),
   
       // ignore new term if same as previous term
       distinctUntilChanged()
     )
     .subscribe((value: string) => {
       // update data source
       this.filtredData = value 
         ? this.filterEntriesByTerm(value, this.datasourceItems) 
         : this.datasourceItems;
        
     });
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();
  }


  refresh() {    
    // update data source
    this.filtredData = this.datasourceItems;   
    this.filterTerm.setValue('', {emitEvent: false});
  }

  private filterEntriesByTerm(term: string, entries: DataSourceItem[]): DataSourceItem[] {
    let filteredEntries: DataSourceItem[] = [];

    entries.forEach(value => {
      if((this.showFields && value.type !== 4) || (!this.showFields && value.type === 1) ) {
        const filteredChildren = this.filterEntriesByTerm(term, value.itens);

        // only keep folder if it still has children
        if(filteredChildren.length) {
          // clone folder since we're overwriting its children
          let clone = Object.assign({}, value);
          clone.itens = filteredChildren;

          filteredEntries.push(clone);
        }
      }
      else {
        const needle = this.removeAccents(term.toLowerCase());
        const haystack = this.removeAccents(value.name.toLowerCase());

        // only keep menu entry if it contains the filter term
        if(haystack.includes(needle)) {
          filteredEntries.push(value);
        }
      }
    });

    return filteredEntries;
  }

  private removeAccents(term: string): string {
    return term.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
  }

  dbChanged(checked: boolean, db: DataSourceItem) {

    db.itens.forEach(table => {
      table.itens.forEach(field => field.selected = checked);
      table.selected = checked;
    })

    // emit changes
    this.datasourceItemsChange.emit(this.datasourceItems);
  }

  tableChanged(checked: boolean, table: DataSourceItem) {
    table.itens.forEach(field => field.selected = checked);

    // emit changes
    this.datasourceItemsChange.emit(this.datasourceItems);
  }

  fieldChanged(checked: boolean, field: DataSourceItem) {
    field.selected = checked

    // emit changes
    this.datasourceItemsChange.emit(this.datasourceItems);
  }

  dbDescendantsAllSelected(db: DataSourceItem): boolean {
    let allFieldsSelected = true;
    db.itens.forEach(table => {
      allFieldsSelected = allFieldsSelected && table.itens.every(field => field.selected)
    })
    return allFieldsSelected && !!db.itens.length;
  }
  dbDescendantsPartiallySelected(db: DataSourceItem): boolean {
    let someFieldsSelected = false;
    db.itens.forEach(table => {
      someFieldsSelected = someFieldsSelected || table.itens.some(field => field.selected)
    })

    return someFieldsSelected && !this.dbDescendantsAllSelected(db);
  }

  tableDescendantsAllSelected(table: DataSourceItem): boolean {    
    const allFieldsSelected = table.itens.every(field => field.selected)
    return allFieldsSelected;
  }
  tableDescendantsPartiallySelected(table: DataSourceItem): boolean {    
    const someFieldsSelected = table.itens.some(field => field.selected)

    return someFieldsSelected && !this.tableDescendantsAllSelected(table);
  }

}
