import { Component } from '@angular/core';
import manualhrs from 'src/app/_files/manualhrs.json'
import { FormControl, FormGroup } from '@angular/forms';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';
import { formatDate } from '@angular/common';
import { DataPullerComponent } from 'src/app/data-puller/data-puller.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-efforts-saving',
  templateUrl: './efforts-saving.component.html',
  styleUrls: ['./efforts-saving.component.scss']
})
export class EffortsSavingComponent {

  records: any[] = [];
  projectNames: string[] = [];
  webHrs: number = manualhrs.web;
  apiHrs: number = manualhrs.api;
  desktopHrs: number = manualhrs.desktop;
  mobHrs: number = manualhrs.mobile;
  monthlyeffortsSavingStackChartData: any;
  monthlyeffortsSavingChartData: any;
  stackoptions: any;
  isLoading = false;

  ngOnInit(): void {
    let formValue = this.dataService.formGroup.value;
  
    // Check if formValue exists and has valid data
    if (!formValue || !formValue.projectName || !formValue.startDate || !formValue.endDate) {
      formValue = {
        projectName: 'ALL',
        startDate: new Date(new Date().getFullYear(), 0, 1), // Start of the current year
        endDate: new Date(new Date().getFullYear(), 11, 31) // End of the current year
      };
    }
    
    Promise.all([
      this.monthlyeffortsSavingStackChart(formValue),
      this.monthlyeffortsSavingChart(formValue)
    ]).then((results) => {
      console.log('Both charts have been processed:', results);
    }).catch((error) => {
      console.error('Error processing charts:', error);
    });
  }

  constructor(private dataService: DataServiceComponent, private data: DataPullerComponent, private http: HttpClient) {
    this.projectNames = Array.from(new Set(this.dataService.records.map(item => item.project)));
    this.projectNames.unshift('ALL')
    this.dataService.projectNames = this.projectNames
  }

  formGroup = new FormGroup({
    projectName: new FormControl(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });


  // onSubmit() {
  //   if (this.formGroup.valid) {
  //     this.dataService.formGroup = this.formGroup;
  //     this.dataService.startDate = new Date(this.formGroup.value.startDate!);
  //     this.dataService.endDate = new Date(this.formGroup.value.endDate!);
  //     this.dataService.projectName = this.formGroup.value.projectName!;
  //     // this.monthlyeffortsSavingStackChart(this.formGroup.value)
  //     // this.monthlyeffortsSavingChart(this.formGroup.value)
  //     const formValue = this.formGroup.value;
  //     Promise.all([
  //       this.monthlyeffortsSavingStackChart(formValue),
  //       this.monthlyeffortsSavingChart(formValue)
  //     ]).then((results) => {
  //       console.log('Both charts have been processed:', results);
  //     }).catch((error) => {
  //       console.error('Error processing charts:', error);
  //     });
  //   }
  // }

  onSubmit() {
    if (this.formGroup.valid) {
      const formValue = this.formGroup.value;
  
      // Check if startDate and endDate are empty
      if (!formValue.startDate) {
        formValue.startDate = new Date(new Date().getFullYear(), 0, 1); // Start of the current year
      }
      if (!formValue.endDate) {
        formValue.endDate = new Date(new Date().getFullYear(), 11, 31); // End of the current year
      }
  
      this.dataService.formGroup = this.formGroup;
      this.dataService.startDate = new Date(formValue.startDate);
      this.dataService.endDate = new Date(formValue.endDate);
      this.dataService.projectName = formValue.projectName;
  
      Promise.all([
        this.monthlyeffortsSavingStackChart(formValue),
        this.monthlyeffortsSavingChart(formValue)
      ]).then((results) => {
        console.log('Both charts have been processed:', results);
      }).catch((error) => {
        console.error('Error processing charts:', error);
      });
    }
  }
  
  monthlyeffortsSavingStackChart(obj: any): any {
    const projectData: { [key: string]: number[] } = {};
    const uniqueProjects = new Set<string>();
    this.records.splice(0, this.records.length);
  
    const url = '/api/get-filter-test-suites-records-year';
    const body = {
      projectName: obj.projectName,
      startDate: this.data.convertDateTimeFormat(obj.startDate),
      endDate: this.data.convertDateTimeFormat(obj.endDate)
    };
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.dataService.bearer}`,
        'Content-Type': 'application/json'
      }),
    };
  
    this.isLoading = true;
    this.http.post(url, body, httpOptions).subscribe((res: any) => {
      this.isLoading = false;
      this.records = res;
  
      this.projectNames = Array.from(new Set(this.records.map(item => item.project)));
      this.projectNames.unshift('ALL');
      this.dataService.projectNames = this.projectNames;
  
      // Calculate Effort Saving
      for (const entry of this.records) {
        const month = new Date(entry.startTime).getMonth(); // Extract month (0-11)
        if (!projectData[entry.project]) {
          projectData[entry.project] = Array(12).fill(0);
          uniqueProjects.add(entry.project);
        }
        projectData[entry.project][month] += entry.duration;
      }
  
      for (const project in projectData) {
        projectData[project] = projectData[project].map((duration, month) => {
          const entries = this.records.filter(entry => entry.project === project && new Date(entry.startTime).getMonth() === month);
          const estimatedManualHours = entries.reduce((total, entry) => {
            const multiplier = entry.runType.toLowerCase().startsWith('web_') ? this.webHrs :
              entry.runType.toLowerCase().startsWith('api_') ? this.apiHrs :
              entry.runType.toLowerCase().startsWith('desktop_') ? this.desktopHrs :
                entry.runType.toLowerCase().startsWith('mobile_') ? this.mobHrs : 0;
            return total + (entry.tests * multiplier);
          }, 0);
          const effortSaving = estimatedManualHours / 60 - (duration / 60) / 60;
          return parseFloat(effortSaving.toFixed(2));
        });
      }
  
      // Prepare chart data
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const labels = monthNames;
      const datasets = Array.from(uniqueProjects).map(project => ({
        label: project,
        data: projectData[project],
        backgroundColor: this.getRandomColor(), // Add color for each project
        stack: 'Stack 0' // Ensure stacking
      }));
      this.monthlyeffortsSavingStackChartData = { labels, datasets };
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching data:', error);
    });
  }
  
  // Helper function to generate random colors
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  

  monthlyeffortsSavingChart(obj: any): any {
    const combinedData = { estimatedManualHours: Array(12).fill(0), duration: Array(12).fill(0) };
    this.records.splice(0, this.records.length);
  
    const url = '/api/get-filter-test-suites-records-year';
    const body = {
      projectName: obj.projectName,
      startDate: this.data.convertDateTimeFormat(obj.startDate),
      endDate: this.data.convertDateTimeFormat(obj.endDate)
    };
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.dataService.bearer}`,
        'Content-Type': 'application/json'
      }),
    };
  
    this.isLoading = true;
    this.http.post(url, body, httpOptions).subscribe((res: any) => {
      this.isLoading = false;
      this.records = res;
  
      this.projectNames = Array.from(new Set(this.records.map(item => item.project)));
      this.projectNames.unshift('ALL');
      this.dataService.projectNames = this.projectNames;
  
      // Calculate Effort Saving
      for (const entry of this.records) {
        const month = new Date(entry.startTime).getMonth(); // Extract month (0-11)
        combinedData.duration[month] += entry.duration / 3600; // Convert seconds to hours
  
        const multiplier = entry.runType.toLowerCase().startsWith('web_') ? this.webHrs :
          entry.runType.toLowerCase().startsWith('api_') ? this.apiHrs :
          entry.runType.toLowerCase().startsWith('desktop_') ? this.desktopHrs :
            entry.runType.toLowerCase().startsWith('mobile_') ? this.mobHrs : 0;
        combinedData.estimatedManualHours[month] += (entry.tests * multiplier) / 60; // Convert minutes to hours
      }
  
      // Calculate Effort Saving
      const effortSaving = combinedData.estimatedManualHours.map((hours, month) => {
        return parseFloat((hours - combinedData.duration[month]).toFixed(2));
      });
  
      // Generate random colors
      const estimatedManualHoursColor = this.getRandomColor();
      const automationExecutionHoursColor = this.getRandomColor();
      const effortSavingColor = this.getRandomColor();
  
      // Prepare chart data
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const labels = monthNames;
      const datasets = [
        {
          label: `Estimated Manual Hours`,
          data: combinedData.estimatedManualHours,
          backgroundColor: Array(12).fill(estimatedManualHoursColor),
          borderColor: Array(12).fill(estimatedManualHoursColor),
          borderWidth: 1
        },
        {
          label: `Automation Execution Hours`,
          data: combinedData.duration,
          backgroundColor: Array(12).fill(automationExecutionHoursColor),
          borderColor: Array(12).fill(automationExecutionHoursColor),
          borderWidth: 1
        },
        {
          label: `Effort Saving (Hours)`,
          data: effortSaving,
          backgroundColor: Array(12).fill(effortSavingColor),
          borderColor: Array(12).fill(effortSavingColor),
          borderWidth: 1
        }
      ];
      this.monthlyeffortsSavingChartData = { labels, datasets };
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching data:', error);
    });
  }

}
