import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { AdvancedSearchMultiSelectComponent } from "./advanced-search-multi-select/advanced-search-multi-select.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatButtonModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from "@angular/material";
import { AdvancedRangeNumbersComponent } from './advanced-range-numbers/advanced-range-numbers.component';
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { AdvancedLabledRangeSelectComponent } from './advanced-labled-range-select/advanced-labled-range-select.component';

@NgModule({
  declarations: [AppComponent, AdvancedSearchMultiSelectComponent, AdvancedRangeNumbersComponent, AdvancedLabledRangeSelectComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatDividerModule,
    MatChipsModule,
    MatButtonModule,
    NgxSliderModule 
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "fill" },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
