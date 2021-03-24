import { EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { ConditionalValidatorBuilder } from './conditional-validator-builder';
import { ConditionalValidatorHelper } from './conditional-validator-helper';

// @dynamic
export class CondValidator {

    static when(condition: (helper: ConditionalValidatorHelper) => boolean) {
        return new ConditionalValidatorBuilder(new ConditionalValidatorHelper(), [condition]);
    }

    static updateTreeValidity(control: AbstractControl, isScopeRoot = true) {
        const ctrl = control as ConditionalControl;
        let oldStatus = ctrl.status;
        let anyStatusChanges = false;

        // enable if ctrl is disabled by this lib
        if (ctrl.conditionDisable === true) {
            ctrl.enable({ onlySelf: true, emitEvent: false });
        }

        // update children
        if (ctrl instanceof FormGroup) {
            Object.keys(ctrl.controls).forEach(key => {
                anyStatusChanges = this.updateTreeValidity(ctrl.get(key)!, false) || anyStatusChanges;
            });
        } else if (ctrl instanceof FormArray) {
            ctrl.controls.forEach(child => {
                anyStatusChanges = this.updateTreeValidity(child, false) || anyStatusChanges;
            });
        }

        // update self, then update ancestors if self is scope root
        let target: ConditionalControl | null = ctrl;
        do {
            target.updateValueAndValidity({ onlySelf: true, emitEvent: false });

            // disable if ctrl is not pass condition, when use diable option
            if (target === ctrl && target.conditionDisable === true) {
                target.disable({ onlySelf: true, emitEvent: false });
            }

            // reset if ctrl is not pass condition, when use reset option
            if (target === ctrl && target.conditionReset !== undefined) {
                target.setValue('',{ onlySelf: true, emitEvent: false });
            }

            // only emit if status change
            if (anyStatusChanges || target.status !== oldStatus) {
                const statusChanges = target.statusChanges as EventEmitter<any>;
                statusChanges.emit(target.status);
                anyStatusChanges = true;
            }

            target = target.parent;
            oldStatus = target?.status ?? '';
        } while (isScopeRoot && target)

        return anyStatusChanges;
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
