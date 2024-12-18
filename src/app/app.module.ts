import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataPullerComponent } from './data-puller/data-puller.component';
import { AgGridAngular } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GridApi } from 'ag-grid-community';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ChartModule } from 'primeng/chart';
import { TreeSelectModule } from 'primeng/treeselect';
import { DataServiceComponent } from './data-service/data-service.component';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from './data-puller/loading-spinner/loading-spinner.component';
import { resolveGuard } from './resolve.guard';
import { PasskeyDialogComponent } from './data-puller/passkey-dialog/passkey-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import { CheckboxCellRendererComponent } from './data-puller/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { CheckboxHeaderComponent } from './data-puller/checkbox-header/checkbox-header.component';
import { AccordionModule } from 'primeng/accordion';
import { AgGridModule } from 'ag-grid-angular';
import { ReportsComponent } from './reports/reports.component';
import { SplitterModule } from 'primeng/splitter';
import { OverviewComponent } from './reports/overview/overview.component';
import { EventCalendarComponent } from './reports/event-calendar/event-calendar.component'; 
import { FullCalendarModule } from '@fullcalendar/angular';
import { EffortsSavingComponent } from './reports/efforts-saving/efforts-saving.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { PowerbiComponent } from './reports/powerbi/powerbi.component';
import { DefectsDialogComponent } from './data-puller/defects-dialog/defects-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { TestStepsDialogComponent } from './data-puller/test-steps-dialog/test-steps-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    DataPullerComponent,
    HeaderComponent,
    LoadingSpinnerComponent,
    PasskeyDialogComponent,
    CheckboxCellRendererComponent,
    CheckboxHeaderComponent,
    ReportsComponent,
    OverviewComponent,
    EventCalendarComponent,
    EffortsSavingComponent,
    ThemeToggleComponent,
    PowerbiComponent,
    DefectsDialogComponent,
    TestStepsDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AgGridAngular,
    HttpClientModule,
    ButtonModule,
    CardModule,
    TableModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    BrowserAnimationsModule,
    ToastModule,
    MultiSelectModule,
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    FlexLayoutModule,
    RouterModule,
    RippleModule,
    ConfirmDialogModule,
    SidebarModule,
    PanelMenuModule,
    ChartModule,
    TreeSelectModule,
    DropdownModule,
    DialogModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    AccordionModule,
    AgGridModule,
    SplitterModule,
    FullCalendarModule,
    PowerBIEmbedModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule
  ],

  providers: [MessageService, GridApi, DataServiceComponent, AppComponent, DataPullerComponent, resolveGuard, DialogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
