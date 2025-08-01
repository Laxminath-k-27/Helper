import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSelectChange, MatSelectModule} from '@angular/material/select';
import { ViewChild } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-add-helper',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  templateUrl: './add-helper.component.html',
  styleUrls: ['./add-helper.component.scss']
})
export class AddHelperComponent{
  
  servicesList: string[] = ['Maid','Cook','Driver','Electrician','Plumber','Gardener','Painter','Carpenter','Mechanic'];
  languagesList: string[] = ['Hindi', 'English', 'Telugu', 'Tamil', 'Marathi'];

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(private _formBuilder: FormBuilder) {}
    firstFormGroup = this._formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', Validators.email],
      services: [[] as string[], Validators.required],
      organization: ['', Validators.required],
      languages: [[] as string[], Validators.required],
      gender: ['', Validators.required] 
    });

    secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });

  
    isAllSelected(): boolean {
      const selected = this.firstFormGroup.get('services')?.value || [];
      return this.servicesList.every(service => selected.includes(service));
    }

    isIndeterminate(): boolean {
      const selected = this.firstFormGroup.get('services')?.value || [];
      return selected.length > 0 && !this.isAllSelected();
    }

    toggleSelectAllCheckbox(event: any): void {
      if (event.checked) {
        this.firstFormGroup.patchValue({ services: [...this.servicesList] });
      } else {
        this.firstFormGroup.patchValue({ services: [] });
      }
    }

    onSelectionChange(event: MatSelectChange){
      this.firstFormGroup.patchValue({ services: event.value });
    }

    areAllLanguagesSelected(): boolean {
      const selected = this.firstFormGroup.get('languages')?.value || [];
      return this.languagesList.every(lang => selected.includes(lang));
    }

    areLanguagesIndeterminate(): boolean {
      const selected = this.firstFormGroup.get('languages')?.value || [];
      return selected.length > 0 && !this.areAllLanguagesSelected();
    }

    toggleSelectAllLanguages(event: any): void {
      if (event.checked) {
        this.firstFormGroup.patchValue({ languages: [...this.languagesList] });
      } else {
        this.firstFormGroup.patchValue({ languages: [] });
      }
    }

    onLanguageSelectionChange(event: MatSelectChange): void {
      const selected: string[] = event.value;
      this.firstFormGroup.patchValue({ languages: selected });
    }


}