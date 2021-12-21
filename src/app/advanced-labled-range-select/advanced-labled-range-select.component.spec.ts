import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedLabledRangeSelectComponent } from './advanced-labled-range-select.component';

describe('AdvancedLabledRangeSelectComponent', () => {
  let component: AdvancedLabledRangeSelectComponent;
  let fixture: ComponentFixture<AdvancedLabledRangeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedLabledRangeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedLabledRangeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
