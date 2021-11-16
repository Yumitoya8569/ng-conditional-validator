# ng-conditional-validator
Angular library help you to build reactive forms dynamic validation

## Quickstart

### Install
```
npm i ng-conditional-validator
```

### Import
```
import { CondValidator } from 'ng-conditional-validator';
```

### Running the showcase
**1. Clone the Git repository and install the dependencies**:
```
git clone https://github.com/Yumitoya8569/ng-conditional-validator.git
cd ng-conditional-validator
npm i
```
**2. Build the library**:
```
npm run build:lib
```
**3. Run the demo**:
```
npm run start
```

## Basic Usage

### `when(condition)`
help you build the condition
```typescript
const contactMe = CondValidator.when(query => query.selectValue('dontContactMe') === false);
const contactByEmail = contactMe.when(query => query.selectValue('contactBy') === 'email');
```

### `bindUpdate(form)`
binding automatic update for your form state
```typescript
CondValidator.bindUpdate(this.formDemo1);
```

### `updateTreeValidity(form)`
update your form state
```typescript
CondValidator.updateTreeValidity(this.formDemo1);
```

### `then(validators)`
if the condition isn't passed, it will not run the given validators
```typescript
buildDemo1() {
    const contactMe = CondValidator.when(query => query.selectValue('dontContactMe') === false);
    const contactByEmail = contactMe.when(query => query.selectValue('contactBy') === 'email');

    this.formDemo1 = this.fb.group({
        dontContactMe: [false],
        contactBy: ['', contactMe.then(Validators.required)],
        email: ['', contactByEmail.then(Validators.required)]
    });

    CondValidator.bindUpdate(this.formDemo1);
    
    console.log(this.formDemo1.value); // { dontContactMe: false, contactBy: '', email: '' }
}
```

### `enable(validators)`
if the condition isn't passed, it will diable the control.
when call form.value it only return enabled control's value.
```typescript
buildDemo3() {
    const contactMe = CondValidator.when(query => query.selectValue('dontContactMe') === false);
    const contactByEmail = contactMe.when(query => query.selectValue('contactBy') === 'email');

    this.formDemo3 = this.fb.group({
        dontContactMe: [false],
        contactBy: ['', contactMe.enable(Validators.required)],
        email: ['', contactByEmail.enable(Validators.required)]
    });

    CondValidator.bindUpdate(this.formDemo3);

    console.log(this.formDemo3.value); // { dontContactMe: false }
}
```

### `then(validators, { resetBy: ... })`
if the condition isn't passed, it will not run the given validators and will reset control's value
```typescript
get contactMe5(){ return this.formDemo5?.get('dontContactMe')?.value === false; }
get contactByEmail5(){ return this.formDemo5?.get('contactBy')?.value === 'email'; }

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
```

### `thenAsync(asyncValidators)`
if the condition isn't passed, it will not run the given async validators
```typescript
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
```

### `invalid(errMsg)`
a validators always return invalid
```typescript
buildDemo2() {
    const notEqual = CondValidator.when(query => query.selectValue('password') !== query.selectValue('repeat'));

    this.formDemo2 = this.fb.group({
        password: ['', Validators.required],
        repeat: ['']
    }, {
        validators: notEqual.then(CondValidator.invalid()) // this line help you check repeat password
    });

    CondValidator.bindUpdate(this.formDemo2);
}
```
