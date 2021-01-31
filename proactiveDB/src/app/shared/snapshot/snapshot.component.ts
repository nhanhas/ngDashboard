import { Input, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, filter, tap, finalize } from 'rxjs/operators';
import { DashboardItem } from 'src/app/core/models/DashboardItem';
import { SnapshotConfigItem } from 'src/app/core/models/SnapshotConfigItem';
import { SystemService } from 'src/app/core/system.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-snapshot',
  templateUrl: './snapshot.component.html',
  styleUrls: ['./snapshot.component.scss']
})
export class SnapshotComponent implements OnInit, OnDestroy {
  @Input() snapshot: SnapshotConfigItem;

  // card
  label: string;
  data: any;
  columns: string[] = [];

  // gauge
  gaugeType = 'arch';
  gaugeLabel = '';
  gaugeAppendText = '';


  loading: boolean;
  
  // unsubscribe
  destroy$ = new Subject<boolean>();

  constructor(
    private systemService: SystemService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.reloadData$
      .pipe(
        takeUntil(this.destroy$),

        filter((value: number) => this.snapshot.SnapShotConfigId === value),

        tap(_ => this.loading = true),

        finalize(() => this.loading = false)
      )      
      .subscribe(_ => this.loadSnapshotResults())

    // load results
    this.loadSnapshotResults();
  }

  private loadSnapshotResults() {
    if(this.snapshot.SnapShotConfigId < 0) { return }
    this.loading = true;
    
    // load from server
    const datesFilter: { startDate: Date, endDate: Date } = this.dashboardDateFilters;
    const endDate = datesFilter.endDate
    const startDate = datesFilter.startDate
    
    // 1 - list, 2 - table
    const loadResults = this.snapshot.SnapShotType === 1 || this.snapshot.SnapShotType === 2
      ? this.dashboardService.loadSnapshotTableResults(this.snapshot.SnapShotConfigId, startDate, endDate)
      : this.dashboardService.loadSnapshotResults(this.snapshot.SnapShotConfigId, startDate, endDate)

    loadResults    
      .pipe(           
        finalize(() => this.loading = false)
      )
      .subscribe(value => {
        // setup chart results
        console.log(value)
        this.setupSnapshot(value);
      })
  }

  ngOnDestroy() {
    // unsubscribe
    this.destroy$.next(true);
    this.destroy$.complete();

    // clear widget in edition
    this.dashboardService.clearWidgetsEdition();
  }

  private setupSnapshot(result) {
    switch (this.snapshot.SnapShotType) {
      case 0:
        this.cardSetup(result);
        break;

      case 1:
      case 2:
        this.tableSetup(result);
        break;  
      case 3:
        this.gaugeSetup(result);
        break;  

      default:
        // never hit this!        
        break;  
    }
  }

  private cardSetup(result) {
    if(result.datasets.length === 0) { return; }

    const label = result.datasets[0].label;
    const data = result.datasets.map(dataset => {
        return dataset.data;
    });
    
    this.label = label;
    this.data = !!data.length
        ? data[0][0]?.y
        : '';
  }

  private tableSetup(result) {
    result = [
      [
        "NumaNodeCount",
        "CPUSockets",
        "IsPolyBaseInstalled",
        "InMemorySupported",
        "IsLocalDB",
        "IsIntegratedSecurityOnly",
        "IsAlwaysOnEnabled",
        "HadrManagerStatus"
      ],
      [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      [
          1,
          2,
          4,
          50,
          60,
          7,
          32,
          60
        ],
        [
          1,
          2,
          4,
          50,
          60,
          7,
          32,
          60
        ],
        [
          1,
          2,
          4,
          50,
          60,
          7,
          32,
          60
        ],
        [
          1,
          2,
          4,
          50,
          60,
          7,
          32,
          60
        ]

        
    ]

    this.columns = result[0];
    result.shift();
    
    this.data = result;
  }

  private gaugeSetup(result) {
    if(result.datasets.length === 0) { return; }

    const label = result.datasets[0].label;
    const data = result.datasets.map(dataset => {
        return dataset.data;
    });
    
    this.gaugeLabel = label;
    this.data = !!data.length
        ? data[0][0]?.y
        : '';
  }

  get dashboardDateFilters(): { startDate: Date, endDate: Date } {
    const dashboardId = this.snapshot.DashBoardId;
    
    const dashboardConfig = this.systemService.dashboards$.value.find((value: DashboardItem) => value.Id === dashboardId);

    const startDateFilter = dashboardConfig.Settings.find((setting: {Key: string, Value: string}) => setting.Key === 'startDateFilter');
    const endDateFilter = dashboardConfig.Settings.find((setting: {Key: string, Value: string}) => setting.Key === 'endDateFilter');

    // in case of no dates or wrong ones
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 6);
    
    return !!startDateFilter && !!endDateFilter 
      ? { startDate: startDateFilter.Value, endDate: endDateFilter.Value }
      : { startDate: start, endDate: end }

  }

  getSnapshotSetting(setting, isNumber?: boolean, defaultNumber?: number) {
    // get setting
    let snapshotSetting = this.snapshot.Settings.find(value => value.Key === setting);
    
    defaultNumber = defaultNumber ? defaultNumber : 0; 

    // remove this if below
    if(snapshotSetting) { 
        snapshotSetting.Value = isNumber 
            ? +snapshotSetting.Value
            : snapshotSetting.Value;

        return snapshotSetting; 
    }

    // if not exist, create it
    this.snapshot.Settings.push({ Key: setting, Value: isNumber ? defaultNumber : '' })

    // return ref
    return this.snapshot.Settings.find(value => value.Key === setting);
  }
}
