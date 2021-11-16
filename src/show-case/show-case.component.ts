import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ConditionalValidatorHelper, ConditionalValidatorBuilder, CondValidator } from 'ng-conditional-validator-lib';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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

    get contactMe5(){
        return this.formDemo5?.get('dontContactMe')?.value === false;
    }

    get contactByEmail5(){
        return this.formDemo5?.get('contactBy')?.value === 'email';
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
        const contactMe = CondValidator.when(query => query.selectValue('dontContactMe') === false);
        const contactByEmail = contactMe.when(query => query.selectValue('contactBy') === 'email');

        this.formDemo1 = this.fb.group({
            dontContactMe: [false],
            contactBy: ['', contactMe.then(Validators.required)],
            email: ['', {
                updateOn: 'blur',
                asyncValidators: contactByEmail.thenAsync(this.asyncEmailValidator)
            }]
        });

        CondValidator.bindUpdate(this.formDemo1);
    }

    buildDemo2() {
        const notEqual = CondValidator.when(query => query.selectValue('password') !== query.selectValue('repeat'));

        this.formDemo2 = this.fb.group({
            password: ['', Validators.required],
            repeat: ['']
        }, {
            validators: notEqual.then(CondValidator.invalid())
        });

        CondValidator.bindUpdate(this.formDemo2);
    }

    buildDemo3() {
        const contactMe = CondValidator.when(query => query.selectValue('dontContactMe') === false);
        const contactByEmail = contactMe.when(query => query.selectValue('contactBy') === 'email');

        this.formDemo3 = this.fb.group({
            dontContactMe: [false],
            contactBy: ['', contactMe.enable(Validators.required)],
            email: ['', contactByEmail.enable(Validators.required)]
        });

        CondValidator.bindUpdate(this.formDemo3);
    }

    buildDemo4() {
        const needLevel2 = CondValidator.when(query => query.select('question1')?.value === true);
        const needLevel3 = CondValidator.when(query => query.select('question3')?.value === true);

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

        CondValidator.bindUpdate(this.formDemo4);
    }

    buildDemo5(){
        const contactMe = CondValidator.when(() => this.contactMe5);
        const contactByEmail = contactMe.when(() => this.contactByEmail5);

        this.formDemo5 = this.fb.group({
            dontContactMe: [false],
            contactBy: ['', contactMe.then(Validators.required, { resetBy: '' })],
            email: ['', contactByEmail.then(Validators.required, { resetBy: '' })]
        });

        CondValidator.bindUpdate(this.formDemo5);
    }

    asyncEmailValidator(control: AbstractControl): Observable<ValidationErrors | null> {
        return of(control.value as string).pipe(
            delay(2000),
            map(res => {
                const regx = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                return regx.test(res) ? null :  { emaliErr: true };
            })
        );
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
        return this.select(path1)?.value === this.select(path2)?.value;
    }
}
