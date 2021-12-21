import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
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

export type AdvancedRangeNumbersValue = {
  min: number | null;
  max: number | null;
} | null;

/** ATTENTION PLEASE!
 * This form control uses this guide:
 * https://material.angular.io/guide/creating-a-custom-form-field-control
 * AND mostly Youtube video group
 * https://www.youtube.com/watch?v=AZsw2nRxkBk&list=PLX7eV3JL9sfkgIka4CmlLMkErbaVPe4LC&index=1
 * Making fixes, be sure that you are not removing important parts
 */

@Component({
  selector: "app-advanced-range-numbers",
  templateUrl: "./advanced-range-numbers.component.html",
  styleUrls: ["./advanced-range-numbers.component.scss"],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: AdvancedRangeNumbersComponent,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedRangeNumbersComponent
  implements
    MatFormFieldControl<AdvancedRangeNumbersValue>,
    ControlValueAccessor,
    OnInit,
    OnChanges,
    OnDestroy
{
  /** -----
   * Important part of the Angular Material Guide
   * (some things was modified)
   */
  static nextId = 0;

  @Input()
  set value(value: AdvancedRangeNumbersValue) {
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
  private _value: AdvancedRangeNumbersValue = null;
  public form: FormGroup;

  stateChanges = new Subject<void>();

  @HostBinding()
  id = `advanced-range-numbers-${AdvancedRangeNumbersComponent.nextId++}`;

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

  onChange: (value: AdvancedRangeNumbersValue) => void;
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

  writeValue(obj: AdvancedRangeNumbersValue): void {
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

  @Input() min: number;
  @Input() max: number;
  @Input() labelMin?: string = "Min";
  @Input() labelMax?: string = "Max";

  /** Unfortunately, slider has errors with value of null
   * it just convert it to 0
   * So the best variant is to keep slider values and actual values separately */
  public slideValueMin: number = 0;
  public slideValueMax: number = 0;
  public sliderOptions: Options = {
    // step: 0.001
  };
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
      if (formValues.min !== null && formValues.max !== null) {
        /** Min value should not be higher than max value */
        if (formValues.min > formValues.max) {
          this.form.get("min").setValue(formValues.max);
          return;
        }

        /** Max value should not be lower than min value */
        if (formValues.max < formValues.min) {
          this.form.get("max").setValue(formValues.min);
          return;
        }
      }

      /** Min value should not be less then predefined min */
      if (formValues.min !== null && formValues.min < this.min) {
        this.form.get("min").setValue(this.min);
        return;
      }

      /** Max value should not be higher then predefined max */
      if (formValues.max !== null && formValues.max > this.max) {
        this.form.get("max").setValue(this.max);
        return;
      }

      this.slideValueMin = formValues.min || this.min;
      this.slideValueMax = formValues.max || this.max;

      if (this.onChange) {
        this.onChange({ ...formValues });
        this.stateChanges.next();
      }
    });
  }

  private _initSlider(): void {
    this.sliderOptions = {
      ...this.sliderOptions,
      floor: this.min,
      ceil: this.max,
    };

    const value = this.value;

    this.slideValueMin = value ? value.min || this.min : this.min;
    this.slideValueMax = value ? value.max || this.max : this.max;
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
        this.form.value.min === null && context.value === this.min
          ? null
          : context.value;
      const maxValue =
        this.form.value.max === null && context.highValue === this.max
          ? null
          : context.highValue;
      this.value = { min: minValue, max: maxValue };
      if (this.onChange) {
        this.onChange({ min: minValue, max: maxValue });
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
