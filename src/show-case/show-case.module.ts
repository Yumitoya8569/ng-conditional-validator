import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShowCaseComponent } from './show-case.component';


@NgModule({
    declarations: [
        ShowCaseComponent
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [ShowCaseComponent]
})
export class ShowCaseModule { }
