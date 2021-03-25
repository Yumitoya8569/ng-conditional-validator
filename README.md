# ng-conditional-validator

A dynamic validator for Angular Reactive Forms


## Quickstart


### Running the Sample
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
help you concatenate the condition
```typescript
const contactMe = CondValidator.when(query => query.selectValue('dontContactMe') === false);
const contactByEmail = contactMe.when(query => query.selectValue('contactBy') === 'email');
```

### `then(validators)`
if not pass condition, it will not run the given validators
```typescript
buildDemo1() {
    const contactMe = CondValidator.when(query => query.selectValue('dontContactMe') === false);
    const contactByEmail = contactMe.when(query => query.selectValue('contactBy') === 'email');

    this.formDemo1 = this.fb.group({
        dontContactMe: [false],
        contactBy: ['', contactMe.then(Validators.required)],
        email: ['', contactByEmail.then(Validators.required)]
    });

    CondValidator.updateTreeValidity(this.formDemo1);
    this.formDemo1.valueChanges.subscribe(() => {
        // your code here ...

        CondValidator.updateTreeValidity(this.formDemo1);
    });
    
    console.log(this.formDemo1.value); // { dontContactMe: false, contactBy: '', email: '' }
}
```

### `enable(validators)`
if not pass condition, it will diable the control.
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

    CondValidator.updateTreeValidity(this.formDemo3);
    this.formDemo3.valueChanges.subscribe(() => {
        // your code here ...

        CondValidator.updateTreeValidity(this.formDemo3);
    });

    console.log(this.formDemo3.value); // { dontContactMe: false }
}
```

### `then(validators, { resetBy: ... })`
if not pass condition, it will not run the given validators and will reset control's value
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

    CondValidator.updateTreeValidity(this.formDemo5);
    this.formDemo5.valueChanges.subscribe(() => {
        // your code here ...

        CondValidator.updateTreeValidity(this.formDemo5);
    });
}
```


