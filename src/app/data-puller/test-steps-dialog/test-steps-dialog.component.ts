import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef  } from '@angular/material/dialog';
import { ThemeService } from 'src/app/theme.service';

@Component({
  selector: 'app-test-steps-dialog',
  templateUrl: './test-steps-dialog.component.html',
  styleUrls: ['./test-steps-dialog.component.scss']
})
export class TestStepsDialogComponent implements OnInit {
  paginationPageSize = 100;
  paginationPageSizeSelector = [100, 200];
  public isDarkTheme!: boolean;
  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  constructor(public dialogRef: MatDialogRef<TestStepsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private themeService: ThemeService) {

  }

  ngOnInit(): void {
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.themeService.updateThemes();
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

}
