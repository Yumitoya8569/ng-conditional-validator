import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConditionalValidatorHelper, ConditionalValidatorBuilder, CondValidator } from 'ng-conditional-validator-lib';

@Component({
    selector: 'app-show-case',
    templateUrl: './show-case.component.html',
    styleUrls: ['./show-case.component.scss']
})
export class ShowCaseComponent implements OnInit {

    formDemo1!: FormGroup;
    formDemo2!: FormGroup;
    formDemo3!: FormGroup;
    formDemo4!: FormGroup;
    formDemo5!: FormGroup;

    _demo5LoveJob = true;
    get demo5LoveJob() {
        return this._demo5LoveJob;

    }
    set demo5LoveJob(val: boolean) {
        if (this._demo5LoveJob !== val) {
            this._demo5LoveJob = val;
            CondValidator.updateTreeValidity(this.formDemo5); // don't forget this
        }
    }

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.buildDemo1();
        this.buildDemo2();
        this.buildDemo3();
        this.buildDemo4();
        this.buildDemo5();
    }

    buildDemo1() {
        const dontLoveJob = CondValidator.when(helper => helper.get('loveJob')?.value === false);
        const whenOther = dontLoveJob.when(helper => helper.get('why')?.value === 'other');

        this.formDemo1 = this.fb.group({
            loveJob: [true],
            why: ['', dontLoveJob.then(Validators.required)],
            other: ['', whenOther.then(Validators.required)]
        });

        this.formDemo1.valueChanges.subscribe(() => {
            CondValidator.updateTreeValidity(this.formDemo1);
        });
    }

    buildDemo2() {
        const notEqual = CondValidator.when(helper => helper.get('password1')?.value !== helper.get('password2')?.value);

        this.formDemo2 = this.fb.group({
            password1: ['', Validators.required],
            password2: ['']
        }, {
            validators: notEqual.then(CondValidator.invalid())
        });

        this.formDemo2.valueChanges.subscribe(() => {
            CondValidator.updateTreeValidity(this.formDemo2);
        });
    }

    buildDemo3() {
        const dontLoveJob = CondValidator.when(helper => helper.get('loveJob')?.value === false);
        const whenOther = dontLoveJob.when(helper => helper.get('why')?.value === 'other');

        this.formDemo3 = this.fb.group({
            loveJob: [true],
            why: ['', [dontLoveJob.enable(), Validators.required]],
            other: ['', [whenOther.enable(), Validators.required]]
        });

        CondValidator.updateTreeValidity(this.formDemo3); // necessary if use .enable()

        this.formDemo3.valueChanges.subscribe(() => {
            CondValidator.updateTreeValidity(this.formDemo3);
        });

    }

    buildDemo4() {
        const needLevel2 = CondValidator.when(helper => helper?.get('question1')?.value === true);
        const needLevel3 = CondValidator.when(helper => helper?.get('question3')?.value === true);

        this.formDemo4 = this.fb.group({
            question1: [false],
            level2: this.fb.group({
                question2: ['', Validators.required],
                question3: [false],
                level3: this.fb.group({
                    question4: ['', Validators.required],
                    question5: ['', Validators.required],
                }, {
                    validators: needLevel3.enable()
                })
            }, {
                validators: needLevel2.enable()
            })
        });

        CondValidator.updateTreeValidity(this.formDemo4); // necessary if use .enable()

        this.formDemo4.valueChanges.subscribe(() => {
            CondValidator.updateTreeValidity(this.formDemo4);
        });
    }

    buildDemo5() {
        const dontLoveJob = CondValidator.when(() => !this.demo5LoveJob);

        this.formDemo5 = this.fb.group({
            why: ['', [dontLoveJob.enable(), Validators.required]]
        });

        CondValidator.updateTreeValidity(this.formDemo5); // necessary if use .enable()

        this.formDemo5.valueChanges.subscribe(() => {
            CondValidator.updateTreeValidity(this.formDemo5);
        });
    }
}

/** helper customization example */
class CustomValidator {
    static when(condition: (helper: CustomHelper) => boolean) {
        return new ConditionalValidatorBuilder(new CustomHelper(), [condition]);
    }
}

class CustomHelper extends ConditionalValidatorHelper {
    equal(path1: string, path2: string) {
        return this.get(path1)?.value === this.get(path2)?.value;
    }
}
