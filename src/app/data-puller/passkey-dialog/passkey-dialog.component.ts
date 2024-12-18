import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  templateUrl: './passkey-dialog.component.html',
  styleUrls: ['./passkey-dialog.component.scss'],
})

export class PasskeyDialogComponent implements OnInit {
  passkey = '';

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {}

  ngOnInit() {
    this.passkey = this.config.data.passkey;
  }

  onSubmit() {
    this.ref.close({ passkey: this.passkey });
  }
}
