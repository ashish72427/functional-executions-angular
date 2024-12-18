import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectsDialogComponent } from './defects-dialog.component';

describe('DefectsDialogComponent', () => {
  let component: DefectsDialogComponent;
  let fixture: ComponentFixture<DefectsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefectsDialogComponent]
    });
    fixture = TestBed.createComponent(DefectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
