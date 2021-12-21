import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IFormOption } from "./models/form.model";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public form: FormGroup;
  public selectSearchOptions: IFormOption[] = [
    { keyValue: 1, viewValue: "1sdvsdvsdvsdvsdsd sdsdsdsd" },
    { keyValue: 2, viewValue: "2" },
    { keyValue: 3, viewValue: "3" },
    { keyValue: 4, viewValue: "4" },
  ];
  public rangeLabelOptions: IFormOption[] = [
    { keyValue: "MTM", viewValue: "MTM" },
    { keyValue: 12, viewValue: "12" },
    { keyValue: 24, viewValue: "24" },
    { keyValue: 36, viewValue: "36" },
    { keyValue: 48, viewValue: "48" },
    { keyValue: 60, viewValue: "60" },
  ];

  constructor() {}

  ngOnInit() {
    this.form = new FormGroup({
      selectSearch: new FormControl({ value: [2], disabled: true }, [
        Validators.required,
      ]),
      rangeNumber: new FormControl({
        value: {
          min: 10,
          max: 200,
        },
        disabled: false,
      }),
      rangeLabel: new FormControl({
        value: {
          min: 'MTM',
          max: 24,
        },
        disabled: false,
      }),
    });

    this.form.valueChanges.subscribe((formValues) => {
      console.log(formValues);
    });
  }
}
