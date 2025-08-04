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
              private http: HttpClient) {}

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

  formData.append('fullName', this.firstFormGroup.get('fullName')?.value ?? ' ');
  formData.append('email', this.firstFormGroup.get('email')?.value ?? ' ');
  formData.append('phone', this.firstFormGroup.get('phone')?.value ?? ' ');

  const photoFile = this.firstFormGroup.get('photo')?.value;
  const kyc = this.firstFormGroup.get('kycDocument')?.value;

  if (photoFile) {
    formData.append('photo', photoFile);
  }

  if (kyc) {
    formData.append('kyc', kyc);
  }

  this.http.post('http://localhost:3000/api/helpers', formData).subscribe({
    next: (res) => {
      console.log('Saved!', res);
      this.firstFormGroup.reset();
      this.selectedKycFile = null;
      this.kycFile = null;

      const kycInput = document.getElementById('kycInput') as HTMLInputElement;
      if (kycInput) kycInput.value = '';

      this.photoUrl=''
      
      this.stepper.reset();
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
