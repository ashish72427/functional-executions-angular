import { Component, OnInit } from '@angular/core';
import { DataServiceComponent } from '../data-service/data-service.component';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  projectNames: string[] = [];
  items!: MenuItem[];

  constructor(private dataService: DataServiceComponent, private themeService: ThemeService) {
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Statistics',
        icon: 'pi pi-file',
        items: [
          {
            label: 'Overview',
            icon: 'pi pi-users',
            routerLink: ['overview'],
          },
          {
            label: 'Projects',
            icon: 'pi pi-file-pdf',
            items: [
              {
                label: 'Web',
                icon: 'pi pi-stop',
                route: '/web',
              },
              {
                label: 'API',
                icon: 'pi pi-check-circle',
                route: '/home',
              }
            ]
          } 
        ]
      },
      {
        label: 'Reports',
        icon: 'pi pi-cloud',
        items: [
          {
            label: 'Efforts Saving',
            icon: 'pi pi-cloud-upload',
            routerLink: ['efforts'],
          },
          {
            label: 'Defects',
            icon: 'pi pi-cloud-download'
          },
          {
            label: 'Summary by Test Results',
            icon: 'pi pi-refresh'
          }
        ]
      },
      {
        label: 'Executions',
        icon: 'pi pi-desktop',
        items: [
          {
            label: 'History',
            icon: 'pi pi-mobile'
          },
          {
            label: 'Calendar',
            icon: 'pi pi-desktop',
            routerLink: ['calendar'],
          }
        ]
      }
    ]
  }
}
