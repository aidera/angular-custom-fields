import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AdvancedRangeNumbersComponent } from "./advanced-range-numbers.component";

describe("AdvancedRangeNumbersComponent", () => {
  let component: AdvancedRangeNumbersComponent;
  let fixture: ComponentFixture<AdvancedRangeNumbersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedRangeNumbersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedRangeNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
