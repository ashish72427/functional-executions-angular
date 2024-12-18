import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';

@Component({
  selector: 'app-checkbox-cell-renderer',
  template: `
    <input type="checkbox" [checked]="value" (change)="onCheckboxChange($event)" />
  `,
})
export class CheckboxCellRendererComponent implements ICellRendererAngularComp {
  public value!: boolean;
  public params: any;

  constructor(public dataService: DataServiceComponent) {}

  agInit(params: any): void {
    this.params = params;
    this.updateCheckboxState();
  }

  refresh(params: any): boolean {
    this.params = params;
    this.updateCheckboxState();
    // this.value = params.value;
    return true;
  }

  updateCheckboxState(): void {
    this.value = false;
    if (this.params.colDef.headerName == 'Application') {
      if (this.params.data['failureType'] == 'Application') {
        this.value = true;
      }
    }

    if (this.params.colDef.headerName == 'Script') {
      if (this.params.data['failureType'] == 'Script') {
        this.value = true;
      }
    }

    if (this.params.colDef.headerName == 'Application/Script') {
      if (this.params.data['failureType'] == 'Application/Script') {
        this.value = true;
      }
    }
  }

  onCheckboxChange(event: any): void {
    const isChecked = event.target.checked;
    const field = this.params.colDef.field;
    const headerName = this.params.colDef.headerName;

    // Decrement counts for previously selected failure type
    if (this.params.data['failureType'] === 'Application') {
      this.dataService.appFailures--;
    } else if (this.params.data['failureType'] === 'Script') {
      this.dataService.scFailures--;
    } else if (this.params.data['failureType'] === 'Application/Script') {
      this.dataService.appFailures--;
      this.dataService.scFailures--;
    }

    // Update the failure type based on the selected checkbox
    if (isChecked) {
      this.params.data['applicationFailureType'] = field === 'applicationFailureType' ? 'Application' : '';
      this.params.data['scriptFailureType'] = field === 'scriptFailureType' ? 'Script' : '';
      this.params.data['combinedFailureType'] = field === 'combinedFailureType' ? 'Application/Script' : '';
      this.params.data['failureType'] = headerName;

      // Increment counts for the newly selected failure type
      if (this.params.data['failureType'] === 'Application') {
        this.dataService.appFailures++;
      } else if (this.params.data['failureType'] === 'Script') {
        this.dataService.scFailures++;
      } else if (this.params.data['failureType'] === 'Application/Script') {
        this.dataService.appFailures++;
        this.dataService.scFailures++;
      }

      // Add node and data to the selected set
      this.params.context.componentParent.selectedTCNodesSet.add(this.params.node);
      this.params.context.componentParent.testCaseIDs.push(this.params.data.testCaseId);
      this.params.context.componentParent.updateTestCasesData.push(this.params.data);
    } else {
      this.params.data[field] = '';
      this.params.data['failureType'] = '';

      // Remove node and data from the selected set
      this.params.context.componentParent.selectedTCNodesSet.delete(this.params.node);
      this.params.context.componentParent.testCaseIDs = this.params.context.componentParent.testCaseIDs.filter((currId: any) => currId !== this.params.data.testCaseId);
      this.params.context.componentParent.updateTestCasesData = this.params.context.componentParent.updateTestCasesData.filter((data: any) => data !== this.params.data);

      // Add node and data to the selected set with failureType as ""
      this.params.context.componentParent.selectedTCNodesSet.add(this.params.node);
      this.params.context.componentParent.testCaseIDs.push(this.params.data.testCaseId);
      this.params.context.componentParent.updateTestCasesData.push(this.params.data);
    }
    this.params.api.refreshCells({ rowNodes: [this.params.node], columns: ['applicationFailureType', 'scriptFailureType', 'combinedFailureType', 'failureType'] });
  }
}