import { EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, asapScheduler } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ConditionalValidatorBuilder } from './conditional-validator-builder';
import { ConditionalValidatorHelper } from './conditional-validator-helper';

// @dynamic
export class CondValidator {

    static bindUpdate(control: AbstractControl) {
        this.updateTreeValidity(control);
        const subscription = control.valueChanges
            .pipe(
                // run after other valueChanges subscription, but before Angular dirty check
                debounceTime(0, asapScheduler)
            ).subscribe(() => {
                CondValidator.updateTreeValidity(control);
            });

        return subscription;
    }

    static when(condition: (helper: ConditionalValidatorHelper) => boolean) {
        return new ConditionalValidatorBuilder(new ConditionalValidatorHelper(), [condition]);
    }

    static updateTreeValidity(control: AbstractControl, isRoot = true) {
        const oldStatus = control.status;
        const oldValue = control.value;
        let ctrl = control as ConditionalControl;
        let anyValueChange = false;
        let anyStatusChange = false;
        let isFormControl = false;

        /* update children */
        if (ctrl instanceof FormGroup) {
            Object.keys(ctrl.controls).forEach(key => {
                const res = this.updateTreeValidity(ctrl.get(key)!, false);
                anyValueChange = anyValueChange || res.anyValueChange;
                anyStatusChange = anyStatusChange || res.anyStatusChange;
            });
        } else if (ctrl instanceof FormArray) {
            ctrl.controls.forEach(child => {
                const res = this.updateTreeValidity(child, false);
                anyValueChange = anyValueChange || res.anyValueChange;
                anyStatusChange = anyStatusChange || res.anyStatusChange;
            });
        } else if (ctrl instanceof FormControl) {
            isFormControl = true;
        }

        ctrl = ctrl as ConditionalControl; // fix Typescript type assertion bug

        /* update self */
        // enable if ctrl is disabled by this lib
        if (ctrl.disabled && ctrl.conditionDisable) {
            ctrl.conditionDisable = undefined;
            ctrl.enable({ onlySelf: true, emitEvent: false });
        }

        // update ctrl
        ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

        // do noting, whe ctrl is disabled
        if (ctrl.disabled) {
            return { anyValueChange, anyStatusChange };
        }

        // reset value if ctrl is not pass condition, when use reset option
        if (ctrl.conditionReset !== undefined) {
            ctrl.setValue('', { onlySelf: true, emitEvent: false });
        }

        // disable if ctrl is not pass condition, when use diable option
        if (ctrl.conditionDisable) {
            ctrl.disable({ onlySelf: true, emitEvent: false });
        }

        // emit if value change
        anyValueChange = anyValueChange || (isFormControl && ctrl.value !== oldValue);
        if (anyValueChange) {
            const valueChanges = ctrl.valueChanges as EventEmitter<any>;
            valueChanges.emit(ctrl.value);
        }

        // emit if status change
        anyStatusChange = anyStatusChange || ctrl.status !== oldStatus;
        if (anyStatusChange) {
            const statusChanges = ctrl.statusChanges as EventEmitter<any>;
            statusChanges.emit(ctrl.status);
        }

        /* update ancestors */
        if (isRoot) {
            ctrl.parent?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }

        return { anyValueChange, anyStatusChange };
    }

    static invalid(errMsg?: ValidationErrors): ValidatorFn {
        return () => { return errMsg ? errMsg : { conditionErr: true }; }
    }
}

export interface ConditionalControl extends AbstractControl {
    conditionReset?: any;
    conditionDisable?: boolean;
    lastPass?: boolean;
    lastValue?: any;
    lastAsync?: Observable<any>;
}
