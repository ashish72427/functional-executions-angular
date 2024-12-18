import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataPullerComponent } from './data-puller/data-puller.component';
import { resolveGuard } from './resolve.guard';
import { ReportsComponent } from './reports/reports.component';
import { OverviewComponent } from './reports/overview/overview.component';
import { EventCalendarComponent } from './reports/event-calendar/event-calendar.component';
import { EffortsSavingComponent } from './reports/efforts-saving/efforts-saving.component';
import { PowerbiComponent } from './reports/powerbi/powerbi.component';

const routes: Routes = [
  {path:'',redirectTo:'home', pathMatch:'full'},
  {path:"home",component:DataPullerComponent, resolve: {data: resolveGuard}},
  {path:"reports", component:PowerbiComponent },
  {path:"details", component:ReportsComponent, 
    children: [
      { path: '', redirectTo: 'calendar', pathMatch: 'full' }, 
      { path: 'overview', component: OverviewComponent }, 
      { path: 'calendar', component: EventCalendarComponent }, 
      { path: 'efforts', component: EffortsSavingComponent }, 
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
