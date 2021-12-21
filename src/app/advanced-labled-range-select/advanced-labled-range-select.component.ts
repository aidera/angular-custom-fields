import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NgControl,
} from "@angular/forms";
import {
  ErrorStateMatcher,
  MatFormFieldControl,
  MatMenuTrigger,
} from "@angular/material";
import { Subject } from "rxjs";
import { ChangeContext, Options } from "@angular-slider/ngx-slider";

import { IFormOption } from "../models/form.model";

export type AdvancedLabledRangeSelectValue = {
  min: any;
  max: any;
} | null;

/** ATTENTION PLEASE!
 * This form control uses this guide:
 * https://material.angular.io/guide/creating-a-custom-form-field-control
 * AND mostly Youtube video group
 * https://www.youtube.com/watch?v=AZsw2nRxkBk&list=PLX7eV3JL9sfkgIka4CmlLMkErbaVPe4LC&index=1
 * Making fixes, be sure that you are not removing important parts
 */

@Component({
  selector: "app-advanced-labled-range-select",
  templateUrl: "./advanced-labled-range-select.component.html",
  styleUrls: ["./advanced-labled-range-select.component.scss"],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: AdvancedLabledRangeSelectComponent,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedLabledRangeSelectComponent
  implements
    MatFormFieldControl<AdvancedLabledRangeSelectValue>,
    ControlValueAccessor,
    OnInit,
    OnDestroy
{
  /** -----
   * Important part of the Angular Material Guide
   * (some things was modified)
   */
  static nextId = 0;

  @Input()
  set value(value: AdvancedLabledRangeSelectValue) {
    this._value = {
      min: value ? value.min : null,
      max: value ? value.max : null,
    };

    if (this.form) {
      this.form.setValue(
        {
          min: value ? value.min : null,
          max: value ? value.max : null,
        },
        { emitEvent: false }
      );
    }

    this._initSlider();

    this.stateChanges.next();
    this._cdr.detectChanges();
  }
  get value() {
    return this._value;
  }
  private _value: AdvancedLabledRangeSelectValue = null;
  public form: FormGroup;

  stateChanges = new Subject<void>();

  @HostBinding()
  id = `advanced-range-numbers-${AdvancedLabledRangeSelectComponent.nextId++}`;

  @Input()
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
    this._cdr.detectChanges();
  }
  get placeholder() {
    return this._placeholder;
  }
  private _placeholder: string;

  focused: boolean;

  get empty(): boolean {
    const value = this.value;

    if (!value) {
      return true;
    }

    if (
      (this.value.min === null || this.value.min === undefined) &&
      (this.value.max === null || this.value.max === undefined)
    ) {
      return true;
    }

    return false;
  }

  @HostBinding("class.floated")
  get shouldLabelFloat(): boolean {
    return !this.empty;
  }

  @Input()
  required: boolean;

  @Input()
  disabled: boolean;

  get errorState() {
    return this.errorMatcher.isErrorState(
      this.ngControl.control as FormControl,
      null
    );
  }

  controlType = "advansed-search-multi-select";
  autofilled = false;

  @HostBinding("attr.aria-describedby") describedBy = "";

  public setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(" ");
  }
  public onContainerClick(): void {
    if (!this.disabled) {
      this.focused = true;
      this.menuTrigger.openMenu();
      this.onDropdownOpen();
      this.stateChanges.next();
      this._cdr.detectChanges();
    }
  }

  onChange: (value: AdvancedLabledRangeSelectValue) => void;
  onTouch: () => void;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private errorMatcher: ErrorStateMatcher,
    private _cdr: ChangeDetectorRef
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(obj: AdvancedLabledRangeSelectValue): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
    this._cdr.detectChanges();
  }

  /** -----
   * Custom part
   */

  /** Options should be SORTED from min to max */
  @Input() options: IFormOption[] = [];
  @Input() labelMin?: string = "Min";
  @Input() labelMax?: string = "Max";

  /** Unfortunately, slider has errors with value of null
   * it just convert it to 0
   * So the best variant is to keep slider values and actual values separately */
  public slideValueMin: number = 0;
  public slideValueMax: number = 0;
  public sliderOptions: Options = {
    showTicks: true,
    translate: (value: number): string => {
      const foundOption = this.options[value];
      return foundOption ? foundOption.viewValue : "";
    },
  };
  public minOptionIndex: number = 0;
  public maxOptionIndex: number = 0;
  public manualRefresh: EventEmitter<void> = new EventEmitter<void>();

  public dropdownWidth: number = 0;

  @ViewChild("control") control: ElementRef;
  @ViewChild("menuTrigger") menuTrigger: MatMenuTrigger;

  ngOnInit(): void {
    this._initForm();
    this._initSlider();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.min || changes.max) {
      this._initSlider();
    }
  }

  private _initForm(): void {
    this.form = new FormGroup({
      min: new FormControl(
        this.value !== null && this.value !== undefined ? this.value.min : null
      ),
      max: new FormControl(
        this.value !== null && this.value !== undefined ? this.value.max : null
      ),
    });

    this.form.valueChanges.subscribe((formValues) => {
      const foundMinOptionIndex = this.options.findIndex(
        (option) => option.keyValue === formValues.min
      );
      const foundMaxOptionIndex = this.options.findIndex(
        (option) => option.keyValue === formValues.max
      );

      if (formValues.min !== null && formValues.max !== null) {
        if (foundMinOptionIndex >= 0 && foundMaxOptionIndex >= 0) {
          /** Min value should not be higher than max value */
          if (foundMinOptionIndex > foundMaxOptionIndex) {
            this.form.setValue({
              min: formValues.max,
              max: formValues.min,
            });
            return;
          }

          /** Max value should not be lower than min value */
          if (foundMaxOptionIndex < foundMinOptionIndex) {
            this.form.setValue({
              min: formValues.max,
              max: formValues.min,
            });

            return;
          }
        }
      }

      /** Min value should not be less then predefined min */
      if (
        formValues.min !== null &&
        foundMinOptionIndex < this.minOptionIndex
      ) {
        this.form
          .get("min")
          .setValue(
            this.options[foundMinOptionIndex]
              ? this.options[foundMinOptionIndex].keyValue
              : null
          );
        return;
      }

      /** Max value should not be higher then predefined max */
      if (
        formValues.max !== null &&
        foundMaxOptionIndex > this.maxOptionIndex
      ) {
        this.form
          .get("max")
          .setValue(
            this.options[foundMaxOptionIndex]
              ? this.options[foundMaxOptionIndex].keyValue
              : null
          );
        return;
      }

      this.slideValueMin =
        foundMinOptionIndex >= 0 ? foundMinOptionIndex : this.minOptionIndex;
      this.slideValueMax =
        foundMaxOptionIndex >= 0 ? foundMaxOptionIndex : this.maxOptionIndex;

      if (this.onChange) {
        if (foundMinOptionIndex <= foundMaxOptionIndex) {
        }
        this.onChange({ ...formValues });
        this.stateChanges.next();
      }
    });
  }

  private _initSlider(): void {
    this.minOptionIndex = 0;
    this.maxOptionIndex = this.options.length ? this.options.length - 1 : 0;

    this.sliderOptions = {
      ...this.sliderOptions,
      floor: 0,
      ceil: this.options.length ? this.options.length - 1 : 0,
    };

    const value = this.value;

    let minValue = this.minOptionIndex;
    let maxValue = this.maxOptionIndex;

    if (value) {
      minValue = this.options.findIndex(
        (option) => option.keyValue === value.min
      );

      maxValue = this.options.findIndex(
        (option) => option.keyValue === value.max
      );
    }

    if (minValue < this.minOptionIndex || minValue < 0) {
      minValue = this.minOptionIndex;
    }
    if (maxValue > this.maxOptionIndex || maxValue < 0) {
      maxValue = this.maxOptionIndex;
    }

    this.slideValueMin = minValue;
    this.slideValueMax = maxValue;
  }

  public preventDefault(event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  public onDropdownOpen(): void {
    this.focused = true;
    this.dropdownWidth = this.control.nativeElement.offsetWidth;
    this.stateChanges.next();
    this._cdr.detectChanges();
    // It will update styles, because it was not initialized correctly with closed dropdown
    setTimeout(() => {
      this.manualRefresh.emit();
    }, 200);
  }

  public onDropdownClose(): void {
    this.focused = false;
    if (this.onTouch) {
      this.onTouch();
    }
    this.stateChanges.next();
    this._cdr.detectChanges();
  }

  public sliderValueChangeHandler(context: ChangeContext): void {
    if (this.form) {
      const minValue =
        this.form.value.min === null && context.value === this.minOptionIndex
          ? null
          : context.value;
      const foundMinOption = this.options[minValue];

      const maxValue =
        this.form.value.max === null &&
        context.highValue === this.maxOptionIndex
          ? null
          : context.highValue;
      const foundMaxOption = this.options[maxValue];

      const value = {
        min: foundMinOption ? foundMinOption.keyValue : null,
        max: foundMaxOption ? foundMaxOption.keyValue : null,
      };

      this.value = { ...value };

      if (this.onChange) {
        this.onChange({ ...value });
      }
    }
  }

  public clearValue(event): void {
    this.preventDefault(event);
    if (this.onTouch) {
      this.onTouch();
    }
    this.value = null;
    if (this.onChange) {
      this.onChange({ min: null, max: null });
    }
    this._cdr.detectChanges();
  }

  public clearFieldValue(event, type: "min" | "max"): void {
    this.preventDefault(event);

    switch (type) {
      case "min":
        this.value = { ...this.value, min: null };
        if (this.onChange) {
          this.onChange({ ...this.value, min: null });
        }
        break;
      case "max":
        this.value = { ...this.value, max: null };
        if (this.onChange) {
          this.onChange({ ...this.value, max: null });
        }
        break;
    }

    this._cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }
}
