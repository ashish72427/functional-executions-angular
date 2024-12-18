import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasskeyDialogComponent } from './passkey-dialog.component';

describe('PasskeyDialogComponent', () => {
  let component: PasskeyDialogComponent;
  let fixture: ComponentFixture<PasskeyDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasskeyDialogComponent]
    });
    fixture = TestBed.createComponent(PasskeyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
