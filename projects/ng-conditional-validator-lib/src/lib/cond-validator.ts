import { EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ConditionalControl, ConditionalValidatorBuilder } from './conditional-validator-builder';
import { ConditionalValidatorHelper } from './conditional-validator-helper';

// @dynamic
export class CondValidator {

    static when(condition: (helper: ConditionalValidatorHelper) => boolean) {
        return new ConditionalValidatorBuilder(new ConditionalValidatorHelper(), [condition]);
    }

    static updateTreeValidity(ctrl: AbstractControl, isScopeRoot = true) {

        // enable ctrl (only for enable solution style)
        if ((ctrl as ConditionalControl).conditionalDisable === true) {
            ctrl.enable({ onlySelf: true, emitEvent: false });
        }

        // update children
        if (ctrl instanceof FormGroup) {
            Object.keys(ctrl.controls).forEach(key => {
                this.updateTreeValidity(ctrl.get(key)!, false);
            });
        } else if (ctrl instanceof FormArray) {
            ctrl.controls.forEach(child => {
                this.updateTreeValidity(child, false);
            });
        }

        // update self, then update ancestors if self is scope root
        let target: AbstractControl | null = ctrl;
        do {
            const oldStatus = target.status;
            const statusChanges = target.statusChanges as EventEmitter<any>;
            target.updateValueAndValidity({ onlySelf: true, emitEvent: false });

            // disable self (only for enable solution style)
            if (target === ctrl && (target as ConditionalControl).conditionalDisable === true) {
                target.disable({ onlySelf: true, emitEvent: false });
            }

            // only emit if status change
            if (target.status !== oldStatus) {
                statusChanges.emit(target.status);
            }
            target = target.parent;
        } while (isScopeRoot && target)
    }

    static invalid(errMsg?: ValidationErrors): ValidatorFn {
        return () => { return errMsg ? errMsg : { conditionErr: true }; }
    }
}
