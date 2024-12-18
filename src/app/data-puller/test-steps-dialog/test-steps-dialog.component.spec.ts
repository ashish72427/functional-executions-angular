import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStepsDialogComponent } from './test-steps-dialog.component';

describe('TestStepsDialogComponent', () => {
  let component: TestStepsDialogComponent;
  let fixture: ComponentFixture<TestStepsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestStepsDialogComponent]
    });
    fixture = TestBed.createComponent(TestStepsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
