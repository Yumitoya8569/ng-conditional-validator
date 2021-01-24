import { AbstractControl } from '@angular/forms';

export class ConditionalValidatorHelper {

    control: AbstractControl | null = null;

    get value() {
        return this.control?.value;
    }

    get(path: string) {
        if(this.control){
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
}
