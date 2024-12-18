import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';
import { DataPullerComponent } from 'src/app/data-puller/data-puller.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  records: any[] = [];
  projectNames: string[] = [];
  executionschartData: any;
  monthlyexecutionChartData: any;
  stackoptions: any;
  isLoading = false;


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
      this.executionsChart(formValue),
      this.monthlyexecutionsChart(formValue)
    ]).then((results) => {
      console.log('Both charts have been processed:', results);
    }).catch((error) => {
      console.error('Error processing charts:', error);
    });
  }
  
  
  // onSubmit() {
  //   if (this.formGroup.valid) {
  //     this.dataService.formGroup = this.formGroup;
  //     this.dataService.startDate = new Date(this.formGroup.value.startDate!);
  //     this.dataService.endDate = new Date(this.formGroup.value.endDate!);
  //     this.dataService.projectName = this.formGroup.value.projectName!;
  //     const formValue = this.formGroup.value;
  //     Promise.all([
  //       this.executionsChart(formValue),
  //       this.monthlyexecutionsChart(formValue)
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
        this.executionsChart(formValue),
        this.monthlyexecutionsChart(formValue)
      ]).then((results) => {
        console.log('Both charts have been processed:', results);
      }).catch((error) => {
        console.error('Error processing charts:', error);
      });
    }
  }
  
  executionsChart(obj: any) {
    const projectOccurrences: { [project: string]: number } = {};
  
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
  
      this.records.forEach((entry) => {
        const currentprojectName = entry.project;
        projectOccurrences[currentprojectName] = (projectOccurrences[currentprojectName] || 0) + 1;
      });
  
      this.dataService.projectOccurrences = projectOccurrences;
  
      this.executionschartData = {
        labels: Object.keys(this.dataService.projectOccurrences),
        datasets: [
          {
            label: 'Total Executions',
            data: Object.values(this.dataService.projectOccurrences),
            backgroundColor: Object.keys(this.dataService.projectOccurrences).map(() => this.getRandomColor()),
            borderColor: Object.keys(this.dataService.projectOccurrences).map(() => this.getRandomColor()),
            borderWidth: 1
          }
        ]
      };
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching data:', error);
    });
  }
  
  monthlyexecutionsChart(obj: any): any {
    // Initialize data structures
    const projectCounts: { [key: string]: number[] } = {};
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
  
      // Process data for chart
      this.records.forEach((entry) => {
        const month = new Date(entry.startTime).getMonth(); // Extract month (0-11)
        if (!projectCounts[entry.project]) {
          projectCounts[entry.project] = Array(12).fill(0);
          uniqueProjects.add(entry.project);
        }
        projectCounts[entry.project][month]++;
      });
  
      // Prepare chart data with actual month names
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const labels = monthNames;
      const datasets = Array.from(uniqueProjects).map(project => ({
        label: project,
        data: projectCounts[project],
        backgroundColor: this.getRandomColor(), // Add color for each project
        stack: 'Stack 0' // Ensure stacking
      }));
  
      this.monthlyexecutionChartData = { labels, datasets };
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
  
}
