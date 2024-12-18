import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataPullerComponent } from './data-puller.component';

describe('LoginComponentComponent', () => {
  let component: DataPullerComponent;
  let fixture: ComponentFixture<DataPullerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataPullerComponent]
    });
    fixture = TestBed.createComponent(DataPullerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
