import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DataServiceComponent } from '../data-service/data-service.component';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PasskeyDialogComponent } from './passkey-dialog/passkey-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CheckboxCellRendererComponent } from './checkbox-cell-renderer/checkbox-cell-renderer.component';
import { CheckboxHeaderComponent } from './checkbox-header/checkbox-header.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ThemeService } from '../theme.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DefectsDialogComponent } from './defects-dialog/defects-dialog.component';
import { TestStepsDialogComponent } from './test-steps-dialog/test-steps-dialog.component';
import * as XLSX from 'xlsx';
import * as fs from 'file-saver';

interface IRow {
  testSuiteId: string;
  project: string;
  runType: string
  environment: string;
  name: string;
  status: number;
  createdAt: string;
  duration: string;
  tests: number;
  passed: number;
  failed: number;
  applicationFailures: number;
  scriptFailures: number;
  defectsCount: number;
  defectsDescription: string;
}

interface casesIRow {
  testCaseId: string;
  name: string;
  status: string;
  failureType: string;
  application: string;
  script: string;
  appScript: string;
  comment: string;
  applicationFailureType: string;
  scriptFailureType: string;
  combinedFailureType: string;
}

interface stepsIRow {
  testStepId: string;
  description: string;
  runType: string;
  status: string;
  expected: string;
  actual: string;
  errorMessage: string;
  startTime: string;
}

@Component({
  selector: 'app-data-puller',
  templateUrl: './data-puller.component.html',
  styleUrls: ['./data-puller.component.scss'],
  providers: [MessageService, PasskeyDialogComponent, DialogService]
})

export class DataPullerComponent implements OnInit {

  isTestStepsLoading = false;
  isTestCasesLoading = false;
  records: any[] = [];
  currTestSuite: any[] = [];
  currTestCase: any[] = [];
  currTestSuiteID: any;
  currDefectCount: any;
  currDefects: any;
  currDefectDescription: any;
  currTestCaseID: any;
  currProjectName: any;
  currSuiteName: any;
  testSuiteIDs: any[] = [];
  updateTestSuitesData: any[] = [];
  testCaseIDs: any[] = [];
  updateTestCasesData: any[] = [];
  pagination = true;
  paginationPageSize = 100;
  paginationPageSizeSelector = [100, 200];
  bearer: any;
  // activeIndex: any = 0;
  testSuitesActiveIndex: any = 0;
  testCasesActiveIndex: any = 0;
  projectNames: string[] = [];
  private gridApi: any;
  private tcgridApi: any;
  private gridColumnApi: any;
  testSuiteId!: string;
  isLoading = false;
  ref: DynamicDialogRef | undefined;
  selectedRowId: string | null = null;
  filteredRowData: any[] = []; // Filtered row data based on checkbox state
  showUnanalyzed: boolean = false; // Checkbox state

  defaultColDef: ColDef = {
    flex: 1,
    filter: true,
    // floatingFilter: true
  };

  toCamelCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  colDefs: ColDef[] = [
    {
      headerName: "", checkboxSelection: true, headerCheckboxSelection: true, flex: .2, headerCheckboxSelectionFilteredOnly: true, headerCheckboxSelectionCurrentPageOnly: true, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "project", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "runType", editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Web_Regression', 'Web_Sanity', 'Web_Pulsecheck', 'Web_General', 'API_Regression', 'API_Sanity', 'API_Pulsecheck', 'API_General', 'Desktop_Regression', 'Desktop_Sanity', 'Mobile_Regression', 'Mobile_Sanity'],
      },
      cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "environment", editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['STG', 'TST', 'PRD'].map(this.toCamelCase),
      },
      cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "name", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "status", editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Passed', 'Failed'].map(this.toCamelCase),
      },
      cellRenderer: (params: any) => {
        const value = this.toCamelCase(params.value);
        const color = value.toLowerCase() === 'passed' ? 'green' : value.toLowerCase() === 'failed' ? 'red' : value.toLowerCase() === 'error' ? 'red' : value.toLowerCase() === 'interrupted' ? 'orange' : value.toLowerCase() === 'warning' ? 'orange' : 'black';
        return `<span style="color: ${color}; font-weight: bold;" title="${value}">${value}</span>`;
      }, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      headerName: "Date",
      flex: 2,
      field: "createdAt", editable: true,
      sort: 'desc',
      sortIndex: 0,
      cellRenderer: (data: any) => {
        const dateStr = data.value ? (new Date(data.value)).toLocaleString('en-GB', { timeZone: 'UTC' }) : '';
        return `<span title="${dateStr}">${dateStr}</span>`;
      }, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      headerName: "Duration(mins)",
      field: "duration",
      editable: true,
      cellRenderer: (params: any) => {
        const durationIns = params.value;
        const durationInMins = (durationIns / 60).toFixed(2); // Convert seconds to minutes
        const durationInHrs = (durationIns / (60 * 60)).toFixed(2); // Convert seconds to hrs
        const durationStr = `${durationInMins} (${durationInHrs} hrs)`;
        return `<span title="${durationStr}">${durationStr}</span>`;
      }, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "tests", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "passed", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "failed", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "applicationFailures", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "scriptFailures", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "defectsCount", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    },
    {
      field: "defectsDescription", editable: true, cellRenderer: this.tooltipRenderer, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testSuiteId === this.currTestSuiteID,
        'highlight-zero-failures': (params: any) => params.data.applicationFailures === 0 && params.data.scriptFailures === 0 && params.data.status.toLowerCase() !== 'passed'
      }
    }
  ];

  tooltipRenderer(params: any) {
    const value = params.value !== undefined && params.value !== null ? params.value : '';
    return `<span title="${value}">${value}</span>`;
  }

  frameworkComponents = {
    CheckboxCellRenderer: CheckboxCellRendererComponent,
    checkboxHeader: CheckboxHeaderComponent,
  };

  casescolDefs: ColDef<casesIRow>[] = [
    // {
    //   headerName: "", 
    //   // checkboxSelection: true, 
    //   checkboxSelection: (params: any) => params.data.status.toLowerCase() === 'passed',
    //   // headerCheckboxSelection: true, 
    //   flex: .2, 
    //   headerCheckboxSelectionFilteredOnly: true, headerCheckboxSelectionCurrentPageOnly: true, cellClassRules: {
    //     'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
    //   }
    // },
    // { field: 'testCaseId' },
    {
      field: 'name', flex: 5, autoHeight: true, cellClass: 'wrap-text', cellClassRules: {
        'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
      }, cellRenderer: this.tooltipRenderer
    },
    {
      field: 'status',
      cellRenderer: (params: any) => {
        const value = this.toCamelCase(params.value);
        const color = value.toLowerCase() === 'passed' ? 'green' : value.toLowerCase() === 'failed' ? 'red' : value.toLowerCase() === 'error' ? 'red' : value.toLowerCase() === 'interrupted' ? 'orange' : value.toLowerCase() === 'warning' ? 'orange' : 'black';
        return `<span style="color: ${color}; font-weight: bold;" title="${value}">${value}</span>`;
      }, cellClassRules: {
        'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
      }
    },
    {
      headerName: 'Application',
      field: 'applicationFailureType',
      cellRenderer: 'CheckboxCellRenderer',
      // headerComponent: 'checkboxHeader',
      onCellValueChanged: (event) => {
        if (event.oldValue !== event.newValue) {
          event.data.failureType = event.newValue;
          if (event.newValue) {
            event.data.scriptFailureType = "";
            event.data.combinedFailureType = "";
          }
          event.api.refreshCells({ columns: ["applicationFailureType", "scriptFailureType", "combinedFailureType", "failureType"] });
        }
      },
      cellClassRules: {
        'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
      }
    },
    {
      headerName: 'Script',
      field: 'scriptFailureType',
      cellRenderer: 'CheckboxCellRenderer',
      // headerComponent: 'checkboxHeader',
      onCellValueChanged: (event) => {
        if (event.oldValue !== event.newValue) {
          event.data.failureType = event.newValue;
          if (event.newValue) {
            event.data.applicationFailureType = "";
            event.data.combinedFailureType = "";
          }
          event.api.refreshCells({ columns: ["applicationFailureType", "scriptFailureType", "combinedFailureType", "failureType"] });
        }
      },
      cellClassRules: {
        'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
      }
    },
    {
      headerName: 'Application/Script',
      field: 'combinedFailureType',
      cellRenderer: 'CheckboxCellRenderer',
      // headerComponent: 'checkboxHeader',
      onCellValueChanged: (event) => {
        if (event.oldValue !== event.newValue) {
          event.data.failureType = event.newValue;
          if (event.newValue) {
            event.data.applicationFailureType = "";
            event.data.scriptFailureType = "";
          }
          event.api.refreshCells({ columns: ["applicationFailureType", "scriptFailureType", "combinedFailureType", "failureType"] });
        }
      },
      cellClassRules: {
        'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
      }
    },
    {
      field: 'failureType',
      headerComponent: 'checkboxHeader',
      cellClassRules: {
        'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
      }, cellRenderer: this.tooltipRenderer
    },
    {
      field: 'comment',
      editable: true,
      cellClassRules: {
        'highlight-selected': (params: any) => params.data.testCaseId === this.selectedRowId
      },
      cellRenderer: this.tooltipRenderer,
      singleClickEdit: false,
      onCellValueChanged: this.onCommentValueChanged.bind(this)
    }
  ];

  onCommentValueChanged(event: any): void {
    const node = event.node;
    const data = event.data;

    // Add node and data to the selected set if not already present
    if (!this.selectedTCNodesSet.has(node)) {
      this.selectedTCNodesSet.add(node);
      this.testCaseIDs.push(data.testCaseId);
      this.updateTestCasesData.push(data);
    }

    // Update the data in the selected set
    const index = this.updateTestCasesData.findIndex(item => item.testCaseId === data.testCaseId);
    if (index !== -1) {
      this.updateTestCasesData[index] = data;
    }

    // Refresh the grid to reflect changes
    event.api.refreshCells({ rowNodes: [node], columns: ['comment'] });
  }

  stepscolDefs: ColDef<stepsIRow>[] = [
    // { field: 'testStepId' },
    {
      field: 'description', flex: 3,
      cellRenderer: (params: any) => {
        if (params.data && (params.data.status === 'info' || params.data.status === '')) {
          return `<span class="wrap-text" title="${params.value}">${params.value}</span>`;
        }
        return `<span title="${params.value}">${params.value}</span>`;
      },
      autoHeight: true, cellClass: 'wrap-text',
      cellClassRules: {
        'highlight-info': (params: any) => (params.data.status === 'info' || params.data.status === '')
      }
      // width: 300
    },
    // { field: 'runType' },
    {
      field: 'status', flex: 1,
      valueGetter: (params) => params.data && (params.data.status === 'info' || params.data.status === '') ? '' : params.data?.status, cellClass: 'wrap-text',
      cellRenderer: (params: any) => {
        const value = this.toCamelCase(params.value);
        const color = value.toLowerCase() === 'passed' || value.toLowerCase() === 'pass' ? 'green' : value.toLowerCase() === 'failed' || value.toLowerCase() === 'fail' ? 'red' : value.toLowerCase() === 'error' ? 'red' : value.toLowerCase() === 'interrupted' ? 'orange' : value.toLowerCase() === 'warning' ? 'orange' : 'black';
        return `<span style="color: ${color}; font-weight: bold;" title="${value}">${value}</span>`;
      },
      cellClassRules: {
        'highlight-info': (params: any) => (params.data.status === 'info' || params.data.status === '')
      }
    },
    {
      field: 'expected', flex: 2,
      valueGetter: (params) => params.data && (params.data.status === 'info' || params.data.status === '') ? '' : params.data?.expected, autoHeight: true, cellClass: 'wrap-text',
      cellRenderer: this.tooltipRenderer,
      cellClassRules: {
        'highlight-info': (params: any) => (params.data.status === 'info' || params.data.status === '')
      }
    },
    {
      field: 'actual', flex: 2,
      valueGetter: (params) => params.data && (params.data.status === 'info' || params.data.status === '') ? '' : params.data?.actual, autoHeight: true, cellClass: 'wrap-text',
      cellRenderer: this.tooltipRenderer,
      cellClassRules: {
        'highlight-info': (params: any) => (params.data.status === 'info' || params.data.status === '')
      }
    },
    {
      field: 'errorMessage', flex: 1,
      valueGetter: (params) => params.data && (params.data.status === 'info' || params.data.status === '') ? '' : params.data?.errorMessage, cellClass: 'wrap-text',
      cellRenderer: this.tooltipRenderer,
      cellClassRules: {
        'highlight-info': (params: any) => (params.data.status === 'info' || params.data.status === '')
      }
    }
  ];

  // gridOptions = {
  //   columnDefs: this.stepscolDefs,
  //   cellClassRules: {
  //     'highlight-info': (params: any) => (params.data.status === 'info' || params.data.status === ''),
  //   }
  // };

  // gridTCOptions = {
  //   onRowClicked: this.onTestCasesRowClicked.bind(this),
  // };

  gridTCOptions: GridOptions = {
    onRowClicked: this.onTestCasesRowClicked.bind(this),
    onRowSelected: this.onTestCasesRowSelected.bind(this),
    rowSelection: 'multiple',
    columnDefs: this.casescolDefs,
    context: { componentParent: this }, // Pass the context to access parent component methods
    // Other grid options if needed...
  };


  rowData: any;
  constructor(private http: HttpClient,
    private messageService: MessageService,
    public dataService: DataServiceComponent,
    private activateRoute: ActivatedRoute,
    public dialogService: DialogService,
    private dialog: MatDialog,
    private router: Router, private themeService: ThemeService
  ) {
  }

  public isDarkTheme!: boolean;

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  ngOnInit(): void {
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.themeService.updateThemes();

    if (this.dataService.records.length > 0) {
      this.records = this.dataService.records;
    } else {
      this.records = this.activateRoute.snapshot.data['data'];
      this.dataService.records = this.records;
      this.projectNames = Array.from(new Set(this.records.map(item => item.project)));
      this.projectNames.unshift('ALL');
      this.dataService.projectNames = this.projectNames;
    }
    this.projectNames = this.dataService.projectNames;

    // Initialize filteredRowData based on showUnanalyzed state
    this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;

    this.activateRoute.queryParams.subscribe(params => {
      this.testSuiteId = params['testSuiteId'];
      if (this.testSuiteId) {
        console.log('testSuiteId from URL:', this.testSuiteId); // Debugging log

        // Delay the removal of testSuiteId to avoid navigation conflicts
        setTimeout(() => {
          this.router.navigate([], {
            relativeTo: this.activateRoute,
            queryParams: { testSuiteId: null },
            queryParamsHandling: 'merge'
          }).then(success => {
            if (success) {
              console.log('testSuiteId removed from URL');
            } else {
              console.log('Failed to remove testSuiteId from URL');
            }
          }).catch(error => {
            console.error('Error removing testSuiteId from URL:', error);
          });
        }, 1000); // Adjust the delay as needed
      }
    });
  }

  onToggleUnanalyzed() {
    if (this.records) {
      this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
    } else {
      this.filteredRowData = [];
    }
  }

  isUnanalyzed(record: any): boolean {
    // Define your condition for unanalyzed records
    return record.applicationFailures === 0 && record.scriptFailures === 0 && record.status.toLowerCase() !== 'passed';
  }

  onBtExport() {
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/[/, ]/g, '_').replace(/:/g, '-');
    const fileName = `Executions_${formattedDateTime}.xlsx`;

    // Extract headers from column definitions and ensure they are strings
    const headers = this.colDefs.map(colDef => colDef.field || '').filter(header => header !== '');

    // Use AG Grid API to get the row data
    const rowData: any[] = [];
    this.gridApi.forEachNodeAfterFilterAndSort((node: any) => {
      rowData.push(node.data);
    });

    // Create worksheet and add headers
    const worksheet = XLSX.utils.json_to_sheet(rowData, { header: headers });

    // Create a new workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook and save it
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    fs.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  }

  onTCBtExport() {
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/[/, ]/g, '_').replace(/:/g, '-');
    const fileName = `TestCases_${this.currProjectName}_${formattedDateTime}.xlsx`;

    const headers = this.casescolDefs.map(colDef => colDef.field || '').filter(header => header !== '');

    const rowData: any[] = [];
    this.tcgridApi.forEachNodeAfterFilterAndSort((node: any) => {
      rowData.push(node.data);
    });

    const worksheet = XLSX.utils.json_to_sheet(rowData, { header: headers });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    fs.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  }


  onGridReady(params: any) {
    this.themeService.updateThemes();
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    if (this.testSuiteId) {
      this.clickRowById(this.testSuiteId);
    }
  }

  onTestCasesGridReady(params: any) {
    this.themeService.updateThemes();
    this.tcgridApi = params.api;
  }

  onTestStepsGridReady(params: any) {
    this.themeService.updateThemes();
  }

  onFirstDataRendered(params: any) {
    if (this.testSuiteId) {
      this.clickRowById(this.testSuiteId);
    }
  }

  clickRowById(testSuiteId: string) {
    console.log('Clicking row with ID:', testSuiteId);
    let foundNode: any = null;

    this.gridApi.paginationSetPageSize(200);
    this.gridApi.forEachNode((node: any) => {
      if (node.data && node.data.testSuiteId === testSuiteId) {
        foundNode = node;
      }
    });

    if (foundNode) {
      foundNode.setSelected(true);
      this.gridApi.ensureIndexVisible(foundNode.rowIndex);
      setTimeout(() => {
        const rowElement = document.querySelector(`[row-id="${foundNode.id}"]`);
        if (rowElement) {
          const event = new MouseEvent('click', { bubbles: true });
          rowElement.dispatchEvent(event);

          // Add highlight class
          rowElement.classList.add('highlight-row');

          // Remove highlight class after 2 seconds
          setTimeout(() => {
            rowElement.classList.remove('highlight-row');
          }, 2000);
        } else {
          console.error('Row element not found for ID:', testSuiteId);
        }
      }, 0);
    } else {
      console.error('Row node not found for ID:', testSuiteId);
    }
  }


  // formGroup = new FormGroup({
  //   projectName: new FormControl(''),
  //   startDate: new FormControl(null),
  //   endDate: new FormControl(null),
  // });

  // onSubmit(event: Event) {
  //   event.stopPropagation();
  //   const formobj = this.formGroup.value;
  //   this.isLoading = true;
  //   this.getFilterTestSuitesRecords(formobj).subscribe((res: any) => {
  //     this.isLoading = false;
  //     this.records = res;
  //     this.dataService.records = res;
  //     this.projectNames = Array.from(new Set(this.records.map(item => item.project)));
  //     this.projectNames.unshift('ALL');
  //     this.dataService.projectNames = this.projectNames;

  //     // Update filteredRowData based on showUnanalyzed state
  //     this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
  //   }, (error) => {
  //     this.isLoading = false;
  //     console.error('Error fetching filtered test suites records', error);
  //   });
  // }

  formGroup = new FormGroup({
    projectName: new FormControl(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });

  onSubmit(event: Event) {
    event.stopPropagation();
    const formobj = this.formGroup.value;
  
    let apiCall: Observable<any>;
  
    // Check if startDate and endDate are empty
    if (!formobj.startDate && !formobj.endDate) {
      // Set default date range for the whole year
      formobj.startDate = new Date(new Date().getFullYear(), 0, 1); // January 1st of the current year
      formobj.endDate = new Date(new Date().getFullYear(), 11, 31); // December 31st of the current year
      apiCall = this.getFilterTestSuitesRecordsyearly(formobj);
    } else {
      apiCall = this.getFilterTestSuitesRecords(formobj);
    }
  
    this.isLoading = true;
    apiCall.subscribe((res: any) => {
      this.isLoading = false;
      this.records = res;
      this.dataService.records = res;
      this.projectNames = Array.from(new Set(this.records.map(item => item.project)));
      this.projectNames.unshift('ALL');
      this.dataService.projectNames = this.projectNames;
  
      // Update filteredRowData based on showUnanalyzed state
      this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching filtered test suites records', error);
    });
  }
  
  convertDateTimeFormat(inputDate: Date): string {
    // ;
    let day = inputDate.getDate().toString().padStart(2, "0");
    let month = (inputDate.getMonth() + 1).toString().padStart(2, "0"); // Add 1 because months are indexed from 0
    let year = inputDate.getFullYear()
    const outputDate = year + '-' + month + '-' + day + 'T00:25:00.000Z';
    return outputDate;
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }


  private filterTestSuitesUrl = `${environment.apiUrl}/get-filter-test-suites-records`;
  getFilterTestSuitesRecords(obj: any): Observable<any> {
    return this.http.post(this.filterTestSuitesUrl, obj);
  }

  private filterTestSuitesUrlyearly = `${environment.apiUrl}/get-filter-test-suites-records-year`;
  getFilterTestSuitesRecordsyearly(obj: any): Observable<any> {
    return this.http.post(this.filterTestSuitesUrlyearly, obj);
  }

  private testSuitesUrl = `${environment.apiUrl}/get-test-suites-records`;
  getTestSuitesRecords(): Observable<any> {
    return this.http.get(this.testSuitesUrl);
  }

  private testStepsUrl = `${environment.apiUrl}/get-test-steps-records`;
  getTestStepsRecords(testSuiteId: string, testCaseId: string): Observable<any> {
    return this.http.get(`${this.testStepsUrl}/${testSuiteId}/${testCaseId}`);
  }

  // onTestSuitesRowClicked(e: any) {
  //   const testSuiteId = e.data.testSuiteId;
  //   this.currTestSuite = e.data.testCases
  //   this.currTestSuiteID = e.data.testSuiteId
  //   this.currDefectCount = e.data.defectsCount
  //   this.currDefectDescription = e.data.defectsDescription
  //   this.dataService.currTestSuite = e.data.testCases
  //   this.dataService.currTestSuiteID = e.data.testSuiteId
  //   this.currProjectName = e.data.project;
  //   this.currSuiteName = e.data.name;

  //   this.router.navigate(['/home'], {
  //     queryParams: { testSuiteId }
  //   }).then(success => {
  //     if (success) {
  //       console.log('Navigation successful, URL updated with testSuiteId');
  //     } else {
  //       console.log('Navigation failed');
  //     }
  //   }).catch(error => {
  //     console.error('Navigation error:', error); // Log any errors
  //   });
  //   this.getFailureCounts(this.currTestSuiteID);
  //   this.gridApi.refreshCells({ force: true });
  // }

  private testCasesUrl = `${environment.apiUrl}/get-test-cases-records`;
  onTestSuitesRowClicked(e: any) {
    const testSuiteId = e.data.testSuiteId;
    // Subscribe to the HTTP request to get the test cases
    this.isTestCasesLoading = true;
    this.http.get(`${this.testCasesUrl}/${testSuiteId}`).subscribe((response: any) => {
      this.currTestSuite = response.testCases;
      this.dataService.currTestSuite = response.testCases;

      // Call getFailureCounts with the fetched test cases
      this.getFailureCounts(response.testCases);

      this.isTestCasesLoading = false;
    });
    this.currTestSuiteID = e.data.testSuiteId
    this.currDefectCount = e.data.defectsCount
    this.currDefectDescription = e.data.defectsDescription
    this.dataService.currTestSuite = e.data.testCases
    this.dataService.currTestSuiteID = e.data.testSuiteId
    this.currProjectName = e.data.project;
    this.currSuiteName = e.data.name;

    this.router.navigate(['/home'], {
      queryParams: { testSuiteId }
    }).then(success => {
      if (success) {
        console.log('Navigation successful, URL updated with testSuiteId');
      } else {
        console.log('Navigation failed');
      }
    }).catch(error => {
      console.error('Navigation error:', error); // Log any errors
    });
    // this.getFailureCounts(this.currTestSuiteID);
    this.gridApi.refreshCells({ force: true });
  }

  selectedTSNodesSet = new Set<any>();
  onTestSuitesRowSelected(e: any) {
    if (e.node.selected) {
      this.selectedTSNodesSet.add(e.node);
      this.testSuiteIDs.push(e.data.testSuiteId)
      this.updateTestSuitesData.push(e.data)
    } else {
      // Remove node from the Set if deselected
      this.selectedTSNodesSet.delete(e.node);
      // Remove data if deselected
      this.testSuiteIDs = this.testSuiteIDs.filter(currId => currId !== e.data.testSuiteId);
      this.updateTestSuitesData = this.updateTestSuitesData.filter(data => data !== e.data);
    }
  }

  onTestCasesRowClicked(e: any) {
    if (e.event.target && e.event.target.type === 'checkbox') {
      return;
    }
    const clickedElement = e.event.target;
    if (clickedElement && clickedElement.closest('.ag-cell') && clickedElement.closest('.ag-cell').getAttribute('col-id') === 'comment') {
      return;
    }
    if (clickedElement.textContent === 'none') {
      return;
    }
    this.currTestCaseID = e.data.testCaseId;
    this.isTestStepsLoading = true;
    this.getTestStepsRecords(this.currTestSuiteID, this.currTestCaseID).subscribe((res: any) => {
      this.selectedRowId = this.currTestCaseID;
      this.tcgridApi.refreshCells({ force: true });
      this.currTestCase = res;
      this.dataService.currTestCase = res;
      const testCaseName = e.data.name;
      this.openTestStepsDialog(res, this.stepscolDefs, testCaseName);
    }, (error) => {
      this.isTestStepsLoading = false;
      console.error('Error fetching test steps:', error);
    });

  }

  openTestStepsDialog(testSteps: any, columnDefs: any, testCaseName: string): void {
    const dialogRef = this.dialog.open(TestStepsDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { testSteps, columnDefs, testCaseName },
      panelClass: 'full-screen-dialog'
    });

    dialogRef.afterOpened().subscribe(() => {
      this.isTestStepsLoading = false;
    });
  }

  selectedTCNodesSet = new Set<any>();
  onTestCasesRowSelected(e: any) {

    if (e.node.selected) {
      this.selectedTCNodesSet.add(e.node);
      this.testCaseIDs.push(e.data.testCaseId)
      this.updateTestCasesData.push(e.data)
      debugger
    } else {
      // Remove node from the Set if deselected
      this.selectedTCNodesSet.delete(e.node);
      // Remove data if deselected
      this.testCaseIDs = this.testCaseIDs.filter(currId => currId !== e.data.testCaseId);
      this.updateTestCasesData = this.updateTestCasesData.filter(data => data !== e.data);
    }
  }

  onReset(e: any) {
    this.testSuiteIDs.splice(0, this.testSuiteIDs.length)
    this.updateTestSuitesData.splice(0, this.updateTestSuitesData.length)
  }

  private apiUrl = `${environment.apiUrl}`;
  updateTestSuitesRecords(testSuiteId: string, updateData: any, bearerToken: string): Observable<any> {
    debugger
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      })
    };
    return this.http.patch(`${this.apiUrl}/update-test-suites-records/${testSuiteId}`, updateData, httpOptions);
  }

  deleteTestSuitesRecords(testSuiteId: string, bearerToken: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${bearerToken}`
      })
    };
    return this.http.delete(`${this.apiUrl}/delete-test-suites-records/${testSuiteId}`, httpOptions);
  }


  onUpdate(e: any): void {
    const baseUrl = '/api/update-test-suites-records/';
    this.ref = this.dialogService.open(PasskeyDialogComponent, {
      header: 'Enter Passkey',
      data: { passkey: '' }
    });
    this.ref.onClose.subscribe((result: any) => {
      if (result && result.passkey) {
        const enteredPasskey = result.passkey;
        const encryptedPassKey = this.dataService.encryptData(enteredPasskey);
        if (enteredPasskey !== null && this.dataService.decryptData(encryptedPassKey).trim() === this.dataService.decryptData('U2FsdGVkX18sgQea0Sxxvej4S4OrDZ6FAXrYr3s8T1Kg0I8eWc09+MqzTVkW3qOj')) {
          if (this.updateTestSuitesData.length > 0) {
            const observables: Observable<any>[] = this.updateTestSuitesData.map(currUpdateData => {
              delete currUpdateData.testCases;
              return this.updateTestSuitesRecords(currUpdateData.testSuiteId, currUpdateData, this.bearer);
            });

            forkJoin(observables).subscribe(
              responses => {
                responses.forEach(response => {
                  console.log(`Record with ID ${response.updated.TestSuiteId} updated successfully.`);
                  this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Record with ID ${response.updated.TestSuiteId} updated successfully.` });
                  if (this.formGroup.value.projectName?.length || this.formGroup.value.startDate != null || this.formGroup.value.endDate != null) {
                    this.isLoading = true;
                    this.getFilterTestSuitesRecords(this.formGroup.value).subscribe((res: any) => {
                      this.isLoading = false;
                      this.records = res;
                      this.dataService.records = res;
                      this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
                    }, (error) => {
                      this.isLoading = false;
                      console.error('Error fetching filtered test suites records', error);
                    });
                  } else {
                    this.isLoading = true;
                    this.getTestSuitesRecords().subscribe((res: any) => {
                      this.isLoading = false;
                      this.records = res;
                      this.dataService.records = res;
                      this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
                    })
                  }
                });
              },
              error => {
                console.error(`Error updating record`, error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
              }
            );
            this.updateTestSuitesData.splice(0, this.updateTestSuitesData.length);
          }
        } else {
          console.error('Invalid passkey.');
          this.messageService.add({ severity: 'error', summary: 'Invalid Passkey', detail: 'Please enter a valid passkey.' });
        }
      } else {
        console.log('No passkey entered.');
        this.messageService.add({ severity: 'error', summary: 'No Passkey Entered', detail: 'Please enter a valid passkey.' });
      }
    });
  }

  onDelete(e: any): void {
    const baseUrl = '/api/delete-test-suites-records/';
    this.ref = this.dialogService.open(PasskeyDialogComponent, {
      header: 'Enter Passkey',
      data: { passkey: '' }
    });
    this.ref.onClose.subscribe((result: any) => {
      if (result && result.passkey) {
        const enteredPasskey = result.passkey;
        const encryptedPassKey = this.dataService.encryptData(enteredPasskey);
        if (enteredPasskey !== null && this.dataService.decryptData(encryptedPassKey).trim() === this.dataService.decryptData('U2FsdGVkX188CMkR3AcSC/ii67MJ4+NHJclHPmhXN3jr7VUH66TsdxXyTiYroKSI')) {
          if (this.testSuiteIDs.length > 0) {
            const observables: Observable<any>[] = this.testSuiteIDs.map((recordId) => {
              const apiUrl = `${baseUrl}${recordId}`;
              const httpOptions = {
                headers: new HttpHeaders({
                  'Authorization': 'Bearer ' + this.bearer
                }),
              };
              console.log(`Sending DELETE request to ${apiUrl}`);
              return this.deleteTestSuitesRecords(recordId, this.bearer).pipe(
                map(() => `Record with ID ${recordId} deleted successfully.`),
                catchError((error) => `Error deleting record with ID ${recordId}: ${error}`)
              );
            });

            forkJoin(observables).subscribe(
              (results) => {
                console.log('All requests completed:', results);
                if (this.formGroup.value.projectName?.length || this.formGroup.value.startDate != null || this.formGroup.value.endDate != null) {
                  this.isLoading = true;
                  this.getFilterTestSuitesRecords(this.formGroup.value).subscribe((res: any) => {
                    this.isLoading = false;
                    this.records = res;
                    this.dataService.records = res;
                    this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
                  }, (error) => {
                    this.isLoading = false;
                    console.error('Error fetching filtered test suites records', error);
                  });
                } else {
                  this.isLoading = true;
                  this.getTestSuitesRecords().subscribe((res: any) => {
                    this.isLoading = false;
                    this.records = res;
                    this.dataService.records = res;
                    this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
                  })
                }
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `All Records deleted successfully.` });
              },
              (error) => {
                console.error('Error:', error);
              }
            );
            this.testSuiteIDs.splice(0, this.testSuiteIDs.length);
          } else {
            console.error('No records selected.');
            this.messageService.add({ severity: 'error', summary: 'No Records Selected', detail: 'Please select records to delete.' });
          }
        } else {
          console.error('Invalid passkey.');
          this.messageService.add({ severity: 'error', summary: 'Invalid Passkey', detail: 'Please enter a valid passkey.' });
        }
      } else {
        console.log('No passkey entered.');
        this.messageService.add({ severity: 'error', summary: 'No Passkey Entered', detail: 'Please enter a valid passkey.' });
      }
    });
  }

  onTCReset(e: any) {
    this.testCaseIDs.splice(0, this.testSuiteIDs.length)
    this.updateTestCasesData.splice(0, this.updateTestSuitesData.length)
  }

  onTCUpdate(e: any): void {
    const baseUrl = `${environment.apiUrl}/update-test-cases/`;
    this.ref = this.dialogService.open(PasskeyDialogComponent, {
      header: 'Enter Passkey',
      data: { passkey: '' }
    });
    debugger
    this.ref.onClose.subscribe((result: any) => {
      if (result && result.passkey) {
        const enteredPasskey = result.passkey;
        const encryptedPassKey = this.dataService.encryptData(enteredPasskey);
        if (enteredPasskey !== null && this.dataService.decryptData(encryptedPassKey).trim() === this.dataService.decryptData('U2FsdGVkX18sgQea0Sxxvej4S4OrDZ6FAXrYr3s8T1Kg0I8eWc09+MqzTVkW3qOj')) {
          if (this.updateTestCasesData.length > 0) {
            const observables: Observable<any>[] = this.updateTestCasesData.map(currUpdateData => {
              const apiUrl = `${baseUrl}${this.currTestSuiteID}/testCases/${currUpdateData.testCaseId}`;
              const httpOptions = {
                headers: new HttpHeaders({
                  'Authorization': `Bearer ${this.bearer}`,
                  'Content-Type': 'application/json'
                })
              };
              debugger
              return this.http.patch(apiUrl, JSON.stringify(currUpdateData), httpOptions);
            });

            forkJoin(observables).subscribe(
              responses => {
                responses.forEach(response => {
                  console.log(`Record with ID ${response.updated.TestCaseId} updated successfully.`);
                  this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Record with ID ${response.updated.TestCaseId} updated successfully.` });
                });
              },
              error => {
                console.error(`Error updating record`, error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
              }
            );
            this.updateTestCasesData.splice(0, this.updateTestCasesData.length);
          }
          this.updateFailedCountsInTestSuite(this.currTestSuiteID, this.dataService.scFailures, this.dataService.appFailures);
        } else {
          console.error('Invalid passkey.');
          this.messageService.add({ severity: 'error', summary: 'Invalid Passkey', detail: 'Please enter a valid passkey.' });
        }
      } else {
        console.log('No passkey entered.');
        this.messageService.add({ severity: 'error', summary: 'No Passkey Entered', detail: 'Please enter a valid passkey.' });
      }
    });
  }

  onTCDelete(e: any): void {
    const baseUrl = `${environment.apiUrl}/delete-test-cases/${this.currTestSuiteID}/testCases/`;
    this.ref = this.dialogService.open(PasskeyDialogComponent, {
      header: 'Enter Passkey',
      data: { passkey: '' }
    });
    this.ref.onClose.subscribe((result: any) => {
      if (result && result.passkey) {
        const enteredPasskey = result.passkey;
        const encryptedPassKey = this.dataService.encryptData(enteredPasskey);
        if (enteredPasskey !== null && this.dataService.decryptData(encryptedPassKey).trim() === this.dataService.decryptData('U2FsdGVkX188CMkR3AcSC/ii67MJ4+NHJclHPmhXN3jr7VUH66TsdxXyTiYroKSI')) {
          if (this.testCaseIDs.length > 0) {
            const observables: Observable<any>[] = this.testCaseIDs.map((recordId) => {
              const apiUrl = `${baseUrl}${recordId}`;
              const httpOptions = {
                headers: new HttpHeaders({
                  'Authorization': 'Bearer ' + this.bearer
                }),
              };
              return this.http.delete(apiUrl, httpOptions).pipe(
                map(() => `Record with ID ${recordId} deleted successfully.`),
                catchError((error) => `Error deleting record with ID ${recordId}: ${error}`)
              );
            });

            forkJoin(observables).subscribe(
              (results) => {
                console.log('All requests completed:', results);
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `All Records deleted successfully.` });
              },
              (error) => {
                console.error('Error:', error);
              }
            );
            this.testCaseIDs.splice(0, this.testSuiteIDs.length);
          }
        } else {
          console.error('Invalid passkey.');
          this.messageService.add({ severity: 'error', summary: 'Invalid Passkey', detail: 'Please enter a valid passkey.' });
        }
      } else {
        console.log('No passkey entered.');
        this.messageService.add({ severity: 'error', summary: 'No Passkey Entered', detail: 'Please enter a valid passkey.' });
      }
    });
  }

  openDialog(selectedRowData: any): void {
    const defectsArray: { description: string }[] = [];
    const linksArray: { url: string }[] = [];

    if (this.currDefectDescription) {
      const lines = this.currDefectDescription.split('\n');
      lines.forEach((line: any) => {
        if (line.startsWith('Link: ')) {
          linksArray.push({ url: line.replace('Link: ', '') });
        } else {
          const match = line.match(/^\d+\.\s(.*)$/);
          if (match) {
            defectsArray.push({ description: match[1] });
          }
        }
      });
    }

    const dialogRef = this.dialog.open(DefectsDialogComponent, {
      width: '550px',
      data: {
        defectsCount: this.currDefectCount || 0,
        defects: defectsArray,
        links: linksArray
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formattedDefectsDescription = result.defects.map((defect: any, index: any) => `${index + 1}. ${defect.description}`).join('\n');
        const formattedLinks = result.links.map((link: any) => `Link: ${link.url}`).join('\n');
        const finalDefectsDescription = formattedLinks ? `${formattedDefectsDescription}\n${formattedLinks}` : formattedDefectsDescription;
        this.addDefects(this.currTestSuiteID, result.defectsCount, finalDefectsDescription);
      }
    });
  }






  addDefects(testSuiteId: string, defectsCount: number, defectsDescription: string): void {
    const baseUrl = `${environment.apiUrl}/add-defects/`;
    const apiUrl = `${baseUrl}${testSuiteId}`;

    // Create the payload with updated fields
    const payload = {
      defectsCount,
      defectsDescription
    };

    // Set the HTTP headers
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.bearer}`,
        'Content-Type': 'application/json'
      })
    };

    // Send the PATCH request to update the record
    this.http.patch(apiUrl, JSON.stringify(payload), httpOptions).subscribe(
      response => {
        console.log(`Record with ID ${testSuiteId} updated successfully.`);
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Record with ID ${testSuiteId} updated successfully.` });
        if (this.formGroup.value.projectName?.length || this.formGroup.value.startDate != null || this.formGroup.value.endDate != null) {
          this.isLoading = true;
          this.getFilterTestSuitesRecords(this.formGroup.value).subscribe((res: any) => {
            this.isLoading = false;
            this.records = res;
            this.dataService.records = res;
            this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
          }, (error) => {
            this.isLoading = false;
            console.error('Error fetching filtered test suites records', error);
          });
        } else {
          this.isLoading = true;
          this.getTestSuitesRecords().subscribe((res: any) => {
            this.isLoading = false;
            this.records = res;
            this.dataService.records = res;
            this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
          })
        }
      },
      error => {
        console.error(`Error updating record`, error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      }
    );
  }

  // getFailureCounts(testSuiteId: string) {
  //   this.dataService.appFailures = 0;
  //   this.dataService.scFailures = 0;
  //   const testSuite = this.records.find(ts => ts.testSuiteId === testSuiteId);

  //   if (testSuite) {
  //     for (const testCase of testSuite.testCases) {
  //       if (testCase.failureType === 'Application') {
  //         this.dataService.appFailures++;
  //       } else if (testCase.failureType === 'Script') {
  //         this.dataService.scFailures++;
  //       }
  //       else if (testCase.failureType === 'Application/Script') {
  //         this.dataService.appFailures++;
  //         this.dataService.scFailures++;
  //       }
  //     }
  //   }
  // }

  // getFailureCounts(testSuiteId: string) {
  //   this.dataService.appFailures = 0;
  //   this.dataService.scFailures = 0;

  //   // Subscribe to the HTTP request to get the test cases
  //   this.http.get(`${this.testCasesUrl}/${testSuiteId}`).subscribe((response: any) => {
  //     const testCases = response.testCases;

  //     for (const testCase of testCases) {
  //       switch (testCase.failureType) {
  //         case 'Application':
  //           this.dataService.appFailures++;
  //           break;
  //         case 'Script':
  //           this.dataService.scFailures++;
  //           break;
  //         case 'Application/Script':
  //           this.dataService.appFailures++;
  //           this.dataService.scFailures++;
  //           break;
  //       }
  //     }
  //   });
  // }

  getFailureCounts(testCases: any[]) {
    this.dataService.appFailures = 0;
    this.dataService.scFailures = 0;
  
    for (const testCase of testCases) {
      switch (testCase.failureType) {
        case 'Application':
          this.dataService.appFailures++;
          break;
        case 'Script':
          this.dataService.scFailures++;
          break;
        case 'Application/Script':
          this.dataService.appFailures++;
          this.dataService.scFailures++;
          break;
      }
    }
  }

  updateFailedCountsInTestSuite(testSuiteId: string, scriptFailures: string, applicationFailures: string): void {
    const baseUrl = `${environment.apiUrl}/update-failed-counts/`;
    const apiUrl = `${baseUrl}${testSuiteId}`;

    // Create the payload with updated fields
    const payload = {
      scriptFailures,
      applicationFailures
    };

    // Set the HTTP headers
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.bearer}`,
        'Content-Type': 'application/json'
      })
    };

    // Send the PATCH request to update the record
    this.http.patch(apiUrl, JSON.stringify(payload), httpOptions).subscribe(
      response => {
        console.log(`Record with ID ${testSuiteId} updated successfully.`);
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Record with ID ${testSuiteId} updated successfully.` });
        if (this.formGroup.value.projectName?.length || this.formGroup.value.startDate != null || this.formGroup.value.endDate != null) {
          this.isLoading = true;
          this.getFilterTestSuitesRecords(this.formGroup.value).subscribe((res: any) => {
            this.isLoading = false;
            this.records = res;
            this.dataService.records = res;
            this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
          }, (error) => {
            this.isLoading = false;
            console.error('Error fetching filtered test suites records', error);
          });
        } else {
          this.isLoading = true;
          this.getTestSuitesRecords().subscribe((res: any) => {
            this.isLoading = false;
            this.records = res;
            this.dataService.records = res;
            this.filteredRowData = this.showUnanalyzed ? this.records.filter(record => this.isUnanalyzed(record)) : this.records;
          })
        }
      },
      error => {
        console.error(`Error updating record`, error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      }
    );
  }


}
