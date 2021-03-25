import { AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';
import { from, of } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { ConditionalControl } from './cond-validator';
import { ConditionalValidatorHelper } from './conditional-validator-helper';

export class ConditionalValidatorBuilder<T extends ConditionalValidatorHelper> {

    private unionConditon: Array<(helper: T) => boolean>;

    constructor(private helper: T, conditons?: Array<(helper: T) => boolean>) {
        this.unionConditon = conditons ?? [];
    }

    /** 
     * Concatenate the condition
     */
    when(condition: (helper: T) => boolean) {
        return new ConditionalValidatorBuilder(this.helper, [...this.unionConditon, condition]);
    }

    /**
     * Run validators when condition pass
     */
    then(validators: ValidatorFn | ValidatorFn[], otherwise?: { resetBy?: any }): ValidatorFn {
        return this.run(validators, otherwise);
    }

    /**
     * Enable control and run validators when condition pass, otherwise disable the control.
     */
    enable(validators?: ValidatorFn | ValidatorFn[]): ValidatorFn {
        return this.run(validators, { disable: true });
    }

    private run(validators?: ValidatorFn | ValidatorFn[], otherwise?: { disable?: boolean, resetBy?: any }): ValidatorFn {
        return (ctrl: ConditionalControl) => {
            this.helper.control = ctrl;
            const conditionPass = this.unionConditon.every(condition => condition(this.helper));

            // hack
            if (otherwise) {
                if (conditionPass) {
                    ctrl.conditionDisable = false;
                    ctrl.conditionReset = undefined;
                } else {
                    ctrl.conditionDisable = otherwise.disable;
                    ctrl.conditionReset = otherwise.resetBy;
                }
            }

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

    /**
     * Run async validators when condition pass.
     * 
     * Note: In current version, A control can only exist one.
     */
    thenAsync(validators: AsyncValidatorFn | AsyncValidatorFn[]): AsyncValidatorFn {
        return (ctrl: ConditionalControl) => {
            this.helper.control = ctrl;
            const conditionPass = this.unionConditon.every(condition => condition(this.helper));

            if (ctrl.lastPass === conditionPass && ctrl.lastValue === ctrl.value && ctrl.lastAsync) {
                return ctrl.lastAsync;
            }

            ctrl.lastPass = conditionPass;
            ctrl.lastValue = ctrl.value;

            if (conditionPass) {
                if (Array.isArray(validators)) {
                    ctrl.lastAsync = from(Validators.composeAsync(validators)!(ctrl))
                } else {
                    ctrl.lastAsync = from(validators(ctrl));
                }
            } else {
                ctrl.lastAsync = of(null);
            }
            ctrl.lastAsync = ctrl.lastAsync.pipe(shareReplay(1), take(1));
            return ctrl.lastAsync;
        };
    }
}