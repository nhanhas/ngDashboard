import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SimpleChanges } from '@angular/core';


/**
 * Flattened tree node that has been created from a FileNode through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface FlatTreeNode {
  name: string;
  type: number;
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-datasource-tree',
  templateUrl: './datasource-tree.component.html',
  styleUrls: ['./datasource-tree.component.scss']
})
export class DatasourceTreeComponent implements OnChanges, OnInit, OnDestroy {
  @Input() datasourceItems: DataSourceItem[];
  @Input() showFields: boolean;

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatTreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<DataSourceItem, FlatTreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<DataSourceItem, FlatTreeNode>;

  filterTerm = new FormControl();
  filtredData: DataSourceItem[] = [];

  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor() {    
  }

  ngOnChanges(changes: SimpleChanges) {
    const datasourceItems = changes['datasourceItems']?.currentValue
    if(datasourceItems && this.dataSource) {
      this.refresh();
    }    
  }

  ngOnInit() {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer.bind(this),
      this.getLevel,
      this.isExpandable.bind(this),
      this.getChildren);

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.datasourceItems;

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
       this.dataSource.data = value 
         ? this.filterEntriesByTerm(value, this.datasourceItems) 
         : this.datasourceItems;
      
      !!value.length 
        ? this.treeControl.expandAll()
        : this.treeControl.collapseAll();

     });
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  refresh() {    
    // update data source
    this.dataSource.data = this.datasourceItems;   
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

  /** Transform the data to something the tree can read. */
  transformer(node: DataSourceItem, level: number) {
    return {
      name: node.name,
      type: node.type,
      level: level,
      expandable: this.showFields 
        ? node.type !== 4 
        : node.type === 1
    };
  }

  /** Get the level of the node */
  getLevel(node: FlatTreeNode) {
    return node.level;
  }

  /** Get whether the node is expanded or not. */
  isExpandable(node: FlatTreeNode) {
    return node.expandable
  }

  /** Get whether the node has children or not. */
  hasChild(index: number, node: FlatTreeNode) {
    return node.expandable
    
  }

  /** Get the children for the node. */
  getChildren(node: DataSourceItem): DataSourceItem[] | null | undefined {
    return node.itens;
  }
}
