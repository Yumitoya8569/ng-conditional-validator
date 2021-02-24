import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { ConditionalValidatorHelper } from './conditional-validator-helper';

export class ConditionalValidatorBuilder<T extends ConditionalValidatorHelper> {

    private unionConditon: Array<(helper: T) => boolean>;

    constructor(private helper: T, conditons?: Array<(helper: T) => boolean>) {
        this.unionConditon = conditons ?? [];
    }

    when(condition: (helper: T) => boolean) {
        return new ConditionalValidatorBuilder(this.helper, [...this.unionConditon, condition]);
    }

    then(validators: ValidatorFn | ValidatorFn[]): ValidatorFn {
        return (ctrl) => {
            this.helper.control = ctrl;
            const conditionPass = this.unionConditon.every(condition => condition(this.helper));

            if (conditionPass) {
                if (Array.isArray(validators)) {
                    return Validators.compose(validators)!(ctrl);
                } else {
                    return validators(ctrl) || null;
                }
            } else {
                return null;
            }
        }
    }

    enable(validators?: ValidatorFn | ValidatorFn[]): ValidatorFn {
        return (ctrl) => {
            this.helper.control = ctrl;
            const conditionPass = this.unionConditon.every(condition => condition(this.helper));
            (ctrl as ConditionalControl).conditionalDisable = !conditionPass; // hack

            if (conditionPass && !!validators) {
                if (Array.isArray(validators)) {
                    return Validators.compose(validators)!(ctrl);
                } else {
                    return validators(ctrl) || null;
                }
            } else {
                return null;
            }
        };
    }
}

export interface ConditionalControl extends AbstractControl {
    conditionalDisable: boolean;
}
