import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';
import { SelectionModel } from '@angular/cdk/collections';
import { from, of } from 'rxjs';


/**
 * Flattened tree node that has been created from a FileNode through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface FlatTreeNode {
  name: string;
  MetadataEntryId: number;
  serviceId: number;
  type: number;

  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-datasource-tree',
  templateUrl: './datasource-tree.component.html',
  styleUrls: ['./datasource-tree.component.scss']
})
export class DatasourceTreeComponent implements OnInit, OnChanges {
  @Input() datasourceItems: DataSourceItem[];
  @Input() showFields: boolean;
  @Input() selectedFields: number[] = [];

  @Output() selectedFieldsChange = new EventEmitter<number[]>();

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatTreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<DataSourceItem, FlatTreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<DataSourceItem, FlatTreeNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<FlatTreeNode>(true /* multiple */);

  constructor() {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer.bind(this),
      this.getLevel,
      this.isExpandable,
      this.getChildren);

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    
  }

  ngOnChanges(changes: SimpleChanges) {
    const selectedFields = changes['selectedFields']?.currentValue
    if(selectedFields && this.treeControl.dataNodes) {
      this.refresh();
    }
    
  }

  ngOnInit() {
    this.dataSource.data = this.datasourceItems;
    
    this.updateSelected();
  }

  private updateSelected() {
    // mark the selected ones
    this.treeControl.dataNodes
    .forEach((fieldNode: FlatTreeNode) => {
      // leaf
      if(this.selectedFields.find(value => value === fieldNode.MetadataEntryId)){
        this.todoItemSelectionToggle(fieldNode, true);        
      }      
    })          

    this.treeControl.dataNodes
    .forEach((fieldNode: FlatTreeNode) => {
      // tables        
      const descendants = this.treeControl.getDescendants(fieldNode); 
      if(!!descendants.length && fieldNode.type === 3){
        if(this.descendantsAllSelected(fieldNode)){
          this.todoItemSelectionToggle(fieldNode, true);  
        }
      }        
    })         

    this.treeControl.dataNodes
    .forEach((fieldNode: FlatTreeNode) => {
      // db        
      const descendants = this.treeControl.getDescendants(fieldNode); 
      if(!!descendants.length && fieldNode.type === 1){
        if(this.descendantsAllSelected(fieldNode)){
          this.todoItemSelectionToggle(fieldNode, true);  
        }
      }        
    })  
  }

  refresh() {    
    this.checklistSelection.clear()
    this.updateSelected();
  }


  /** Transform the data to something the tree can read. */
  transformer(node: DataSourceItem, level: number) {
    return {
      name: node.name,
      MetadataEntryId: node.MetadataEntryId,
      serviceId: node.serviceId,
      type: node.type,
      level: level,
      //expandable: !!node.itens.length || node.type === 1 || (this.showFields && node.type === 3) // type 4 is a field 
      expandable: this.showFields ? (!!node.itens.length || node.type !== 4) : (node.type === 1)
    };
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: FlatTreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    
    // in case of no children
    if(!descendants.length) { return false; }

    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FlatTreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: FlatTreeNode, skipUpdate?: boolean): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    if(!skipUpdate) {
      const selected = this.checklistSelection.selected.map(value => value.MetadataEntryId);
      this.selectedFields = selected;
      this.selectedFieldsChange.emit(this.selectedFields);
    }
  }

  /** Get the level of the node */
  getLevel(node: FlatTreeNode) {
    return node.level;
  }

  /** Get whether the node is expanded or not. */
  isExpandable(node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get whether the node has children or not. */
  hasChild(index: number, node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get the children for the node. */
  getChildren(node: DataSourceItem): DataSourceItem[] | null | undefined {
    return node.itens;
  }
}
