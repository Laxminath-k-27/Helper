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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';


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
    MatDialogModule,
    HttpClientModule
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

// ... imports remain unchanged
export class AddHelperComponent {
  servicesList: string[] = ['Maid','Cook','Driver','Electrician','Plumber','Gardener','Painter','Carpenter','Mechanic'];
  languagesList: string[] = ['Hindi', 'English', 'Telugu', 'Tamil', 'Marathi'];
  phonePrefixes: string[] = ['+91', '+1', '+44', '+61', '+81'];
  vehicleTypes: string[] = ['none', 'Bike', 'Car', 'Auto'];
  documentTypes = ['Aadhar', 'Voter ID', 'Passport', 'PAN Card'];

  photoUrl: String | null = null; 

  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('kycDialog') kycDialogTemplate!: any;

  selectedKycFile: File | null = null;
  kycFile: File | null = null;
  kycDialogRef: any;

  selectedOtherFile: File | null = null;
  otherFile: File | null = null;
  otherDialogRef: any;

  constructor(private _formBuilder: FormBuilder, 
              private dialog: MatDialog,
              private http: HttpClient,
              private router: Router) {}

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
    kycDocType: ['', Validators.required]
  });

  secondFormGroup = this._formBuilder.group({
    otherDocument: [null as File | null],
    otherDocType: ['']
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

  onSelectionChange(event: MatSelectChange) {
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

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Store the File object in the form group control
    this.firstFormGroup.get('photo')?.setValue(file);

    // Read and preview the file (as base64)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        this.photoUrl = result; // Store base64 string for preview
      }
    };
    reader.readAsDataURL(file);
  }
}



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
    }
  }

  cancelKycFile(): void {
    this.selectedKycFile = null;
    this.kycFile = null;
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
      width: '600px',

      disableClose: true
    });
  }

  onOtherFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type === 'application/pdf') {
      this.selectedOtherFile = file;
      this.secondFormGroup.get('otherDocument')?.setValue(file);
    }
  }

  saveOtherFile(): void {
    if (this.secondFormGroup.get('otherDocType')?.value && this.selectedOtherFile) {
      this.otherFile = this.selectedOtherFile;
      this.otherDialogRef.close();
    }
  }

  cancelOtherFile(): void {
    this.selectedOtherFile = null;
    this.secondFormGroup.patchValue({
      otherDocument: null,
      otherDocType: ''
    });
    this.otherDialogRef.close();
  }

  get otherDocumentControl(): FormControl {
    return this.secondFormGroup.get('otherDocument') as FormControl;
  }

  // for preventing navigation using stepper
  onStepperSelectionChange(event: StepperSelectionEvent): void {
  if (event.previouslySelectedIndex !== event.selectedIndex) {
    this.stepper.selectedIndex = event.previouslySelectedIndex;
  }
}

submitForm(): void {
  const formData = new FormData();

  const firstControls = this.firstFormGroup.controls;
  formData.append('fullName', firstControls['fullName'].value ?? '');
  formData.append('email', firstControls['email'].value ?? '');
  formData.append('services', JSON.stringify(firstControls['services'].value ?? []));
  formData.append('organization', firstControls['organization'].value ?? '');
  formData.append('languages', JSON.stringify(firstControls['languages'].value ?? []));
  formData.append('gender', firstControls['gender'].value ?? '');
  formData.append('phonePrefix', firstControls['phonePrefix'].value ?? '');
  formData.append('phoneNumber', firstControls['phoneNumber'].value ?? '');
  formData.append('vehicleType', firstControls['vehicleType'].value ?? '');
  formData.append('vehicleNumber', firstControls['vehicleNumber'].value ?? '');
  formData.append('kycDocType', firstControls['kycDocType'].value ?? '');

  const photoFile = firstControls['photo'].value;
  const kycFile = firstControls['kycDocument'].value;

  if (photoFile) formData.append('photo', photoFile);
  if (kycFile) formData.append('kycDocument', kycFile);

  const secondControls = this.secondFormGroup.controls;
  formData.append('otherDocType', secondControls['otherDocType'].value ?? '');

  const otherFile = secondControls['otherDocument'].value;
  if (otherFile) formData.append('otherDocument', otherFile);

  this.http.post('http://localhost:3000/api/helpers', formData).subscribe({
    next: (res) => {

      console.log('Saved!', res);

      this.firstFormGroup.reset();
      this.secondFormGroup.reset();

      this.selectedKycFile = null;
      this.kycFile = null;
      this.photoUrl = null;

      const fileInputs = ['photoInput', 'kycInput', 'otherInput'];
      fileInputs.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el) el.value = '';
      });
      
      this.stepper.reset();

      this.router.navigate(['../']);
    },
    error: (err) => console.error('Failed to save', err)
  });
}

  logging() {
    console.log(this.firstFormGroup.value, this.secondFormGroup.value);
    console.log(this.firstFormGroup.get('photo')?.value)
    this.submitForm();
  }
}
