import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { DataSourceItem } from 'src/app/core/models/DataSourceItem';

@Component({
  selector: 'app-dataset-picker',
  templateUrl: './dataset-picker.component.html',
  styleUrls: ['./dataset-picker.component.scss']
})
export class DatasetPickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() datasourceItems: DataSourceItem[];
  @Input() xAxisField: any;
  @Input() yAxisFields: any[] = [];

  @Output() xAxisFieldChange = new EventEmitter<number>();

  // field map for better performance
  fieldsMap = new Map<number, { datasource: string, dataset: string, fieldName: string }>();
  
  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor() {
  }


  ngOnChanges(changes: SimpleChanges) {
    const datasourceItems = changes['datasourceItems']?.currentValue
    if(datasourceItems ) {
      this.refresh();
    }    
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  refresh() {    
    this.setupFieldMap();
  }

  // setup map indexed by field metadataEntry
  private setupFieldMap() {    
    this.datasourceItems.forEach(datasource => {
      datasource.itens.forEach(dataset => {
        dataset.itens.forEach(datafield => {          
          this.fieldsMap.set(datafield.MetadataEntryId, { datasource: datasource.name, dataset: dataset.name, fieldName: datafield.name });
        })
      })
    })
  }

  // on drop y field
  dropXField(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.yAxisFields, event.previousIndex, event.currentIndex);
    } else {

      const { metaDataEntryId, name } = event.item.data;
      // check if field already picked
      if(this.xAxisField === metaDataEntryId) { return; }

      // otherwise replace it
      this.xAxisField = metaDataEntryId;      
      this.xAxisFieldChange.emit(metaDataEntryId);
    }
  }

  // on drop y field
  dropYField(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.yAxisFields, event.previousIndex, event.currentIndex);
    } else {

      const { metaDataEntryId, name } = event.item.data;
      // check if field already picked
      const alreadyIn = this.yAxisFields.find(field => field.metaDataEntryId === metaDataEntryId);
      if(alreadyIn) { return; }

      // otherwise use it
      this.yAxisFields.push({
        Id: 0,
        description: null,
        function: 0,
        metaDataEntryId: metaDataEntryId,
        name: name,
        order: 0
      })
      
    }
  }

  // util for field info
  fieldLabel(metaDataEntryId: number): string {
    return metaDataEntryId 
      ? this.fieldsMap.get(metaDataEntryId).fieldName
      : '';
  }

}
