// import { Component } from '@angular/core';
// import { IHeaderAngularComp } from 'ag-grid-angular';
// import { DataPullerComponent } from '../data-puller.component';
// import { DataServiceComponent } from 'src/app/data-service/data-service.component';

// @Component({
//   selector: 'app-checkbox-header',
//   template: `
//     <input type="checkbox" [checked]="selectAll" (change)="onSelectAllChange($event)" />
//     {{ params.column.colDef.headerName }}
//   `,
// })
// export class CheckboxHeaderComponent implements IHeaderAngularComp {
//   public selectAll: boolean = false;
//   public params: any;

//   constructor(
//     public dataService: DataServiceComponent,
//     public data: DataPullerComponent
//   ) { }

//   agInit(params: any): void {
//     this.params = params;
//   }

// onSelectAllChange(event: any): void {
//   this.selectAll = event.target.checked;
//   const colHeader = this.params.column.colDef.headerName;
//   const checkboxRenderer = this.params.column.colDef;

//   if (checkboxRenderer) {
//     this.params.api.forEachNodeAfterFilterAndSort((node: any) => {
//       node.setDataValue(checkboxRenderer.field, this.selectAll ? colHeader : '');

//       // Update the parent component's selected nodes and data
//       if (this.selectAll) {
//         this.params.context.componentParent.selectedTCNodesSet.add(node);
//         this.params.context.componentParent.testCaseIDs.push(node.data.testCaseId);
//         this.params.context.componentParent.updateTestCasesData.push(node.data);
//       } else {
//         this.params.context.componentParent.selectedTCNodesSet.delete(node);
//         this.params.context.componentParent.testCaseIDs = this.params.context.componentParent.testCaseIDs.filter((currId: any) => currId !== node.data.testCaseId);
//         this.params.context.componentParent.updateTestCasesData = this.params.context.componentParent.updateTestCasesData.filter((data: any) => data !== node.data);
//       }
//     });

//     this.params.api.refreshCells({ force: true });
//     this.getFailureCounts(this.dataService.currTestSuiteID);
//   }
// }

//   refresh(params: any): boolean {
//     this.params = params;
//     this.selectAll = params.value;
//     return true;
//   }

//   getFailureCounts(testSuiteId: string) {
//     this.dataService.appFailures = 0;
//     this.dataService.scFailures = 0;
//     const testSuite = this.data.records.find(ts => ts.testSuiteId === testSuiteId);

//     if (testSuite) {
//       for (const testCase of testSuite.testCases) {
//         if (testCase.applicationFailureType === 'Application') {
//           this.dataService.appFailures++;
//         } else if (testCase.scriptFailureType === 'Script') {
//           this.dataService.scFailures++;
//         } else if (testCase.combinedFailureType === 'Application/Script') {
//           this.dataService.appFailures++;
//           this.dataService.scFailures++;
//         }
//       }
//     }
//   }
// }

import { Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { DataPullerComponent } from '../data-puller.component';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';
import { IHeaderParams } from 'ag-grid-community';


@Component({
  selector: 'app-checkbox-header',
  template: `
    <div class="custom-header">
      <span>{{ params.displayName }}</span>
      <select (change)="onDropdownChange($event)">
        <option value="">Select</option>
        <option value="Application">Application</option>
        <option value="Script">Script</option>
        <option value="Application/Script">Application/Script</option>
      </select>
    </div>
  `,
  styles: [`
    .custom-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    select {
      margin-top: 5px;
    }
  `]
})
export class CheckboxHeaderComponent implements IHeaderAngularComp {
  params!: IHeaderParams;

  constructor(
    public dataService: DataServiceComponent,
    public data: DataPullerComponent
  ) { }

  agInit(params: IHeaderParams): void {
    this.params = params;
  }

  onDropdownChange(event: any): void {
    const selectedValue = event.target.value;
    const colDef = this.params.column.getColDef();
    const field = colDef.field;

    if (!field) {
      console.error('Column definition field is undefined');
      return;
    }

    this.params.api.forEachNodeAfterFilterAndSort((node: any) => {
      // Decrement counts for previously selected failure type
      if (node.data[field] === 'Application') {
        this.dataService.appFailures--;
      } else if (node.data[field] === 'Script') {
        this.dataService.scFailures--;
      } else if (node.data[field] === 'Application/Script') {
        this.dataService.appFailures--;
        this.dataService.scFailures--;
      }

      // Update the failure type
      node.setDataValue(colDef.field, selectedValue);

      // Increment counts for the new selected failure type
      if (selectedValue === 'Application') {
        this.dataService.appFailures++;
      } else if (selectedValue === 'Script') {
        this.dataService.scFailures++;
      } else if (selectedValue === 'Application/Script') {
        this.dataService.appFailures++;
        this.dataService.scFailures++;
      }

      // Update the parent component's selected nodes and data
      if (selectedValue) {
        this.params.context.componentParent.selectedTCNodesSet.add(node);
        this.params.context.componentParent.testCaseIDs.push(node.data.testCaseId);
        this.params.context.componentParent.updateTestCasesData.push(node.data);
      } else {
        this.params.context.componentParent.selectedTCNodesSet.delete(node);
        this.params.context.componentParent.testCaseIDs = this.params.context.componentParent.testCaseIDs.filter((currId: any) => currId !== node.data.testCaseId);
        this.params.context.componentParent.updateTestCasesData = this.params.context.componentParent.updateTestCasesData.filter((data: any) => data !== node.data);

        // Add node and data to the selected set with failureType as ""
        this.params.context.componentParent.selectedTCNodesSet.add(node);
        this.params.context.componentParent.testCaseIDs.push(node.data.testCaseId);
        this.params.context.componentParent.updateTestCasesData.push(node.data);
      }
    });

    this.params.api.refreshCells({ force: true });
  }


  refresh(params: IHeaderParams): boolean {
    this.params = params;
    return true;
  }

  getFailureCounts(testSuiteId: string) {
    debugger
    this.dataService.appFailures = 0;
    this.dataService.scFailures = 0;
    const testSuite = this.data.records.find(ts => ts.testSuiteId === testSuiteId);

    if (testSuite) {
      for (const testCase of testSuite.testCases) {
        if (testCase.applicationFailureType === 'Application') {
          this.dataService.appFailures++;
        } else if (testCase.scriptFailureType === 'Script') {
          this.dataService.scFailures++;
        } else if (testCase.combinedFailureType === 'Application/Script') {
          this.dataService.appFailures++;
          this.dataService.scFailures++;
        }
      }
    }
  }
}

