import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


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
    MatRadioModule,
    MatDialogModule
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
  phonePrefixes: string[] = ['+91', '+1', '+44', '+61', '+81'];
  vehicleTypes: string[] = ['none', 'Bike', 'Car', 'Auto'];
  documentTypes = ['Aadhar', 'Voter ID', 'Passport', 'PAN Card'];

  photoUrl: string | null = null;

  @ViewChild('stepper') stepper!: MatStepper;


  @ViewChild('kycDialog') kycDialogTemplate!: any;

  selectedKycFile: File | null = null;
  kycFile: File | null = null;
  kycDialogRef: any;

  selectedOtherFile: File | null = null;
  otherFile: File | null = null;
  otherDialogRef: any;

  constructor(private _formBuilder: FormBuilder, private dialog: MatDialog ) {}
    firstFormGroup = this._formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', Validators.email],
      services: [[] as string[], Validators.required],
      organization: ['', Validators.required],
      languages: [[] as string[], Validators.required],
      gender: ['', Validators.required],
      phonePrefix: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      vehicleType: ['none'],
      vehicleNumber: [''],
      photo: [null as File | null],
      kycDocument: [null as File | null],
      kycDocType: [''],
      otherDocument: [null as File | null],
      otherDocType: ['']
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

    triggerFileInput(fileInput: HTMLInputElement) {
      fileInput.click();
    }

    onFileSelected(event: Event) {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      console.log(file)
      if (file) {
        this.firstFormGroup.get('photo')?.setValue(file);

        const reader = new FileReader();
        reader.onload = () => {
          this.photoUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }


    // dailog
    openKycUploadModal(templateRef: any): void {
      this.kycDialogRef = this.dialog.open(templateRef, {
        width: '400px',
        disableClose: true
      });
    }

    onKycFileSelected(event: Event): void {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && file.type === 'application/pdf') {
        this.selectedKycFile = file;
        this.firstFormGroup.get('kycDocument')?.setValue(file);
      }
    }

    saveKycFile(): void {
      if (this.firstFormGroup.get('kycDocType')?.value && this.selectedKycFile) {
        this.kycFile = this.selectedKycFile;
        this.kycDialogRef.close();
        console.log(this.kycFile)
      }
    }

    cancelKycFile(): void {
      this.selectedKycFile = null;
      this.firstFormGroup.patchValue({
        kycDocument: null,
        kycDocType: ''
      });
      this.kycDialogRef.close();
    }

    get kycDocumentControl(): FormControl {
      return this.firstFormGroup.get('kycDocument') as FormControl;
    }

    openOtherUploadModal(templateRef: any): void {
      this.otherDialogRef = this.dialog.open(templateRef, {
        width: '400px',
        disableClose: true
      });
    }

    onOtherFileSelected(event: Event): void {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && file.type === 'application/pdf') {
        this.selectedOtherFile = file;
        this.firstFormGroup.get('otherDocument')?.setValue(file);
      }
    }

    saveOtherFile(): void {
      if (this.firstFormGroup.get('otherDocType')?.value && this.selectedOtherFile) {
        this.otherFile = this.selectedOtherFile;
        this.otherDialogRef.close();
        console.log(this.otherFile)
      }
    }

    cancelOtherFile(): void {
      this.selectedOtherFile = null;
      this.firstFormGroup.patchValue({
        otherDocument: null,
        otherDocType: ''
      });
      this.otherDialogRef.close();
    }

    get otherDocumentControl(): FormControl {
      return this.firstFormGroup.get('otherDocument') as FormControl;
    }

    logging(){
      console.log(this.firstFormGroup)
    }

}