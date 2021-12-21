import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AdvancedSearchMultiSelectComponent } from "./advanced-search-multi-select.component";

describe("AdvancedMultiSelectComponent", () => {
  let component: AdvancedSearchMultiSelectComponent;
  let fixture: ComponentFixture<AdvancedSearchMultiSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedSearchMultiSelectComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
