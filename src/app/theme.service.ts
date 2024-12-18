import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkTheme = false;
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('isDarkTheme', this.isDarkTheme.toString());
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
      this.renderer.removeClass(document.body, 'dark-theme');
    }
    this.updateThemes();
  }

  public updateThemes() {
    this.updateAgGridTheme();
    this.updateAccordionTheme();
    this.updateCalendarTheme();
  }

  public updateAgGridTheme() {
    const agGridElements = document.querySelectorAll('.ag-theme-quartz');
    agGridElements.forEach((element) => {
      if (this.isDarkTheme) {
        this.renderer.addClass(element, 'ag-theme-quartz-dark');
      } else {
        this.renderer.removeClass(element, 'ag-theme-quartz-dark');
      }
    });
  }

  public updateAccordionTheme() {
    const accordionElements = document.querySelectorAll('p-accordion');
    accordionElements.forEach((element) => {
      if (this.isDarkTheme) {
        this.renderer.addClass(element, 'dark-theme');
      } else {
        this.renderer.removeClass(element, 'dark-theme');
      }
    });
  }

  public updateCalendarTheme() {
    const calendarElements = document.querySelectorAll('p-calendar');
    calendarElements.forEach((element) => {
      if (this.isDarkTheme) {
        this.renderer.addClass(element, 'dark-theme');
      } else {
        this.renderer.removeClass(element, 'dark-theme');
      }
    });
  }
}
