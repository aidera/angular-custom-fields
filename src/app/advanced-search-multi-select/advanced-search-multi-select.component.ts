import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { ControlValueAccessor, FormControl, NgControl } from "@angular/forms";
import {
  ErrorStateMatcher,
  MatFormFieldControl,
  MatMenuTrigger,
} from "@angular/material";
import { Subject } from "rxjs";

import { IFormOption } from "../models/form.model";

export type AdvancedSearchMultiSelectValue = any[];

/** ATTENTION PLEASE!
 * This form control uses this guide:
 * https://material.angular.io/guide/creating-a-custom-form-field-control
 * AND mostly Youtube video group
 * https://www.youtube.com/watch?v=AZsw2nRxkBk&list=PLX7eV3JL9sfkgIka4CmlLMkErbaVPe4LC&index=1
 * Making fixes, be sure that you are not removing important parts
 */
@Component({
  selector: "app-advanced-search-multi-select",
  templateUrl: "./advanced-search-multi-select.component.html",
  styleUrls: ["./advanced-search-multi-select.component.scss"],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: AdvancedSearchMultiSelectComponent,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchMultiSelectComponent
  implements
    MatFormFieldControl<AdvancedSearchMultiSelectValue>,
    ControlValueAccessor,
    OnInit,
    OnChanges,
    AfterViewInit,
    OnDestroy
{
  /** -----
   * Important part of the Angular Material Guide
   * (some things was modified)
   */
  static nextId = 0;

  @Input()
  set value(value: AdvancedSearchMultiSelectValue) {
    this._value = value;
    this._checkChipsNewLine();
    this.stateChanges.next();
    this._cdr.detectChanges();
  }
  get value() {
    return this._value;
  }
  private _value: AdvancedSearchMultiSelectValue;

  stateChanges = new Subject<void>();

  @HostBinding()
  id = `advanced-search-multi-select-${AdvancedSearchMultiSelectComponent.nextId++}`;

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
    return !this.value || this.value.length < 1;
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

  onChange: (value: AdvancedSearchMultiSelectValue) => void;
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

  writeValue(obj: AdvancedSearchMultiSelectValue): void {
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

  @Input() options: IFormOption[] = [];

  @ViewChild("control") control: ElementRef;
  @ViewChild("menuTrigger") menuTrigger: MatMenuTrigger;
  @ViewChild("chipListInnerContainer") chipListInnerContainer: ElementRef;

  public selectedOptions: IFormOption[] = [];
  public filteredOptions: IFormOption[] = [];
  public searchControl: FormControl;
  public dropdownWidth: number = 0;
  public defaultChipListHeight: number = 42; //actually it's 40, but can be more cause of different browsers
  public chipListHeight: number = 0;

  ngOnInit(): void {
    this._initOptions();
    this._initForm();
  }

  ngAfterViewInit(): void {
    this._checkChipsNewLine();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      this._initOptions();
    }
  }

  private _initOptions(): void {
    this.filteredOptions = [...this.options];
  }

  private _initForm(): void {
    this.searchControl = new FormControl("");
    this.searchControl.valueChanges.subscribe((searchString) => {
      this._filterOptions(searchString);
    });
  }

  private _filterOptions(searchString: string): void {
    const cleanSearchString = searchString.trim().toLowerCase();
    let newOptions = [...this.options];
    if (cleanSearchString) {
      newOptions = newOptions.filter((el) =>
        el.viewValue.toLowerCase().includes(cleanSearchString)
      );
    }
    this.filteredOptions = newOptions;
  }

  /** The idea is to display dots
   * only if chip-list has two lines of chips instead of one */
  private _checkChipsNewLine(): void {
    if (
      this.chipListInnerContainer &&
      this.chipListInnerContainer.nativeElement
    ) {
      this.chipListHeight =
        this.chipListInnerContainer.nativeElement.offsetHeight;
    }
  }

  public checkIsChecked(value): boolean {
    return this.value.includes(value);
  }

  public getDisplayValue(key): string {
    const found = this.options.find((el) => el.keyValue === key);
    if (found) {
      return found.viewValue;
    } else {
      return "";
    }
  }

  public preventDefault(event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  public onDropdownOpen(): void {
    this.focused = true;
    this.dropdownWidth = this.control.nativeElement.offsetWidth;
    this.searchControl.setValue("");
    this.stateChanges.next();
    this._cdr.detectChanges();
  }

  public onDropdownClose(): void {
    this.focused = false;
    if (this.onTouch) {
      this.onTouch();
    }
    this.stateChanges.next();
    this._cdr.detectChanges();
  }

  public selectOption(event, value): void {
    this.preventDefault(event);

    const foundIndex = this.value.findIndex((el) => el === value);
    let newValue = [];
    if (foundIndex >= 0) {
      newValue = [...this.value];
      newValue.splice(foundIndex, 1);
    } else {
      this.options.forEach((option) => {
        if (option.keyValue === value || this.value.includes(option.keyValue)) {
          newValue.push(option.keyValue);
        }
      });
    }
    this.value = newValue;
    this.selectedOptions = newValue.map((el) => {
      return this.options.find((option) => option.keyValue === el);
    });
    if (this.onChange) {
      this.onChange(newValue);
    }
    this._cdr.detectChanges();
  }

  public toggleAll(event): void {
    this.preventDefault(event);
    if (this.value.length === this.options.length) {
      this.value = [];
      this.selectedOptions = [];
    } else {
      this.value = this.options.map((option) => option.keyValue);
      this.selectedOptions = [...this.options];
    }
    if (this.onChange) {
      this.onChange(this.value);
    }
    this._cdr.detectChanges();
  }

  public removeSelected(key: any): void {
    if (this.onTouch) {
      this.onTouch();
    }
    this.value = [...this.value].filter((el) => el !== key);
    this.selectedOptions = [...this.selectedOptions].filter(
      (el) => el.keyValue !== key
    );
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  public clearValue(event): void {
    if (this.onTouch) {
      this.onTouch();
    }
    this.preventDefault(event);
    this.value = [];
    this.selectedOptions = [];
    if (this.onChange) {
      this.onChange([]);
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }
}
