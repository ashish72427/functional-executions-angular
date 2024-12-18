import { Component, OnInit } from '@angular/core';
import * as pbi from 'powerbi-client';

@Component({
  selector: 'app-powerbi',
  templateUrl: './powerbi.component.html',
  styleUrls: ['./powerbi.component.scss']
})

export class PowerbiComponent implements OnInit {
  embedConfig!: pbi.models.IReportEmbedConfiguration;
  eventHandlers!: Map<string, (event?: any) => void>;

  ngOnInit() {
    this.embedConfig = {
      type: 'report',
      // id: '<Report Id>',
      embedUrl: 'https://app.fabric.microsoft.com/view?r=eyJrIjoiM2I5YmJiMDUtYWIzZi00NjRhLWFmYzQtNjkxNDdmZjhhMmEwIiwidCI6ImYzNGY2Mzg3LTNiN2YtNDAwMi04ZTM1LWFjMzdhZWM2MjI0MSJ9',
      // accessToken: '<Access Token>',
      tokenType: pbi.models.TokenType.Embed,
      settings: {
        panes: {
          filters: {
            expanded: false,
            visible: false
          }
        },
        background: pbi.models.BackgroundType.Transparent,
      }
    };

    this.eventHandlers = new Map([
      ['loaded', () => console.log('Report loaded')],
      ['rendered', () => console.log('Report rendered')],
      ['error', (event: any) => console.log(event.detail)]
    ]);
  }
}