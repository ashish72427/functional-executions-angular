import { Component, OnInit } from '@angular/core';
import { DataServiceComponent } from './data-service/data-service.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
  title = 'functional';

  constructor(public dataService: DataServiceComponent, private themeService: ThemeService) {

  }

  ngOnInit(): void {
    this.themeService.updateThemes();
    // if (!this.dataService.bearer?.length)
    //   this.dataService.isLoading = true;
    //   this.authService.getToken().subscribe(
    //     (response) => {
    //       const bearerToken = response.access_token;
    //       // console.log('Bearer Token:', bearerToken);
    //       this.dataService.bearer = bearerToken;
    //       this.dataService.getTestSuitesRecords().subscribe(
    //         (response) => {
    //           this.dataService.isLoading = false;
    //           this.dataService.records = response;
    //           this.dataService.projectNames = Array.from(new Set(response.map((item: any) => item.project)));
    //           this.dataService.projectNames.unshift('ALL')
    //         }
    //       );
    //     },
    //     (error) => {
    //       console.error('Error fetching token:', error);
    //     }
    //   );
  }
}

