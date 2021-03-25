import { AbstractControl } from '@angular/forms';

export class ConditionalValidatorHelper {

    control: AbstractControl | null = null;

    get value() {
        return this.control?.value;
    }

    /**
     * Select the control with given path
     * 
     * It will try from current to root until getting a control
     */
    select(path: string) {
        if (this.control) {
            let result: AbstractControl | null = null;
            let target: AbstractControl | null = this.control;

            do {
                result = target?.get(path) ?? null;
                target = target?.parent ?? null;
            } while (!result && target)

            return result;
        }
        return null;
    }

    /**
     * Select the control value with given path
     * 
     * note: It will try from current to root until getting a control
     */
    selectValue<T = any>(path: string): T{
        return this.select(path)?.value;
    }
}
