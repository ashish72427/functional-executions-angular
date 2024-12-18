import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffortsSavingComponent } from './efforts-saving.component';

describe('EffortsSavingComponent', () => {
  let component: EffortsSavingComponent;
  let fixture: ComponentFixture<EffortsSavingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EffortsSavingComponent]
    });
    fixture = TestBed.createComponent(EffortsSavingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
