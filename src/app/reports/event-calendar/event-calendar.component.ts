import { Component, OnInit } from '@angular/core';
import { DataServiceComponent } from 'src/app/data-service/data-service.component';
import { CalendarOptions, Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-event-calendar',
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.scss'],
})

export class EventCalendarComponent implements OnInit {
  records!: any[];
  projectNames: string[] = [];
  currentView: 'dayGridMonth' | 'timeGridDay' | 'timeGridWeek' | 'listWeek' = 'dayGridMonth';

  constructor(private dataService: DataServiceComponent) {
    this.handleEventClick = this.handleEventClick.bind(this);
    this.projectNames = Array.from(new Set(this.dataService.records.map(item => item.project)));
    this.projectNames.unshift('ALL')
    this.dataService.projectNames = this.projectNames
  }

  calendarOptions: CalendarOptions = {
    initialView: this.currentView,
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    editable: false,
    weekends: true,
    headerToolbar: {
      left: 'dayGridMonth timeGridDay timeGridWeek listWeek',
      center: 'title',
      right: 'prev,next today',
    },
    events: [],
    eventClick: this.handleEventClick,
  };

  calendar!: Calendar;

  onCalendarInit(calendar: any) {
    this.calendar = calendar;
  }

  formGroup = new FormGroup({
    projectName: new FormControl(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    this.records = this.dataService.records;
    this.calendarOptions.events = this.createEventsFromRecords();
  }

  createEventsFromRecords(): any[] {
    return this.records.map((record) => ({
      title: `${record.project}, Script: ${record.scriptFailures}, App: ${record.applicationFailures}`,
      start: record.startTime,
      allDay: false,
      extendedProps: {
        project: record.project,
        author: record.author,
        status: record.status,
        duration: record.duration,
        tests: record.tests,
        passed: record.passed,
        failed: record.failed,
        scriptFailures: record.scriptFailures,
        applicationFailures: record.applicationFailures,
        errors: record.errors,
        skipped: record.skipped,
        testSuiteId: record.testSuiteId,
      },
    }));
  }

  createEventsFromFilteredRecords(): any[] {
    const selectedProject = this.formGroup.value.projectName;
    const filteredRecords = this.records.filter(record => {
      return selectedProject === 'ALL' || record.project === selectedProject;
    });

    return filteredRecords.map((record) => ({
      title: `${record.project}, Script: ${record.scriptFailures}, App: ${record.applicationFailures}`,
      start: record.startTime,
      allDay: false,
      extendedProps: {
        project: record.project,
        author: record.author,
        status: record.status,
        duration: record.duration,
        tests: record.tests,
        passed: record.passed,
        failed: record.failed,
        scriptFailures: record.scriptFailures,
        applicationFailures: record.applicationFailures,
        errors: record.errors,
        skipped: record.skipped,
        testSuiteId: record.testSuiteId,
      },
    }));
  }


  handleEventClick(info: any) {
    // const eventTitle = info.event.title;
    const eventStart = info.event.start;
    const eventDetails = info.event.extendedProps;

    const htmlContent = `
      <strong>Project:</strong> ${eventDetails.project}<br>
      <strong>Start Time:</strong> ${eventStart}<br>
      <strong>Author:</strong> ${eventDetails.author}<br>
      <strong>Status:</strong> ${eventDetails.status}<br>
      <strong>Duration:</strong> ${eventDetails.duration} hours<br>
      <strong>Tests:</strong> ${eventDetails.tests}<br>
      <strong>Passed:</strong> ${eventDetails.passed}<br>
      <strong>Failed:</strong> ${eventDetails.failed}<br>
      <strong>Script Failures:</strong> ${eventDetails.scriptFailures}<br>
      <strong>Application Failures:</strong> ${eventDetails.applicationFailures}<br>
      <strong>Errors:</strong> ${eventDetails.errors}<br>
      <strong>Skipped:</strong> ${eventDetails.skipped}<br>
      <a id="viewInGridLink" href="/#/home?testSuiteId=${eventDetails.testSuiteId}">view more...</a>
    `;

    Swal.fire({
      title: 'Test Suite details',
      html: htmlContent,
      icon: 'info',
      didOpen: () => {
        const link = document.getElementById('viewInGridLink');
        if (link) {
          link.addEventListener('click', () => {
            Swal.close();
          });
        }
      }  
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.dataService.formGroup = this.formGroup;
      this.dataService.projectName = this.formGroup.value.projectName;
      this.calendarOptions.events = this.createEventsFromFilteredRecords();
    }
  }

}
