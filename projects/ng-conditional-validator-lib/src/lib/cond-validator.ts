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

    static updateTreeValidity(control: AbstractControl, isRoot = true) {
        let ctrl = control as ConditionalControl;
        let oldStatus = ctrl.status;
        let anyStatusChanges = false;

        // enable if ctrl is disabled by this lib
        if (ctrl.conditionDisable === true) {
            ctrl.enable({ onlySelf: true, emitEvent: !isRoot });
        }

        /* update children */
        if (ctrl instanceof FormGroup) {
            Object.keys(ctrl.controls).forEach(key => {
                anyStatusChanges = this.updateTreeValidity(ctrl.get(key)!, false) || anyStatusChanges;
            });
        } else if (ctrl instanceof FormArray) {
            ctrl.controls.forEach(child => {
                anyStatusChanges = this.updateTreeValidity(child, false) || anyStatusChanges;
            });
        }


        /* update self */
        ctrl = control as ConditionalControl;
        ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: !isRoot });

        // reset if ctrl is not pass condition, when use reset option
        if (ctrl.conditionReset !== undefined) {
            ctrl.setValue('', { onlySelf: true, emitEvent: !isRoot });
        }

        // disable if ctrl is not pass condition, when use diable option
        if (ctrl.conditionDisable === true) {
            ctrl.disable({ onlySelf: true, emitEvent: !isRoot });
        }

        // emit if self or child status change
        if(isRoot){
            if (anyStatusChanges || ctrl.status !== oldStatus) {
                anyStatusChanges = true;
                const statusChanges = ctrl.statusChanges as EventEmitter<any>;
                statusChanges.emit(ctrl.status);
            }
        }


        /* update ancestors */
        if (isRoot) {
            ctrl.parent?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        }

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
