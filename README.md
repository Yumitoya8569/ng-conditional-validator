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
ng run start
```


## Basic Usage

### Usage (stateless solution)
```typescript
// when build form
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
    
    console.log(this.formDemo1.value); // { loveJob: true, why: '', other: '' }
}
```

### Usage  (enable solution)
enable solution will control form disable status, when call form.value you will get only necessary result
```typescript
// when build form
buildDemo3() {
    const dontLoveJob = CondValidator.when(helper => helper.get('loveJob')?.value === false);
    const whenOther = dontLoveJob.when(helper => helper.get('why')?.value === 'other');

    this.formDemo3 = this.fb.group({
        loveJob: [true],
        why: ['', dontLoveJob.enable(Validators.required)],
        other: ['', whenOther.enable(Validators.required)]
    });

    CondValidator.updateTreeValidity(this.formDemo3); // necessary if use .enable()

    this.formDemo3.valueChanges.subscribe(() => {
        CondValidator.updateTreeValidity(this.formDemo3);
    });
    
    console.log(this.formDemo3.value); // { loveJob: true }
}
```


