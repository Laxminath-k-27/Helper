import { Component } from '@angular/core';
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
import { MatDividerModule } from '@angular/material/divider';
import { AfterViewInit } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { TickDialogComponent } from '../tick-dialog/tick-dialog.component';
import { QrDialogComponent } from '../qr-dialog/qr-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


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
    HttpClientModule,
    MatDividerModule,
    QRCodeModule,
    TickDialogComponent,
    QrDialogComponent,
    MatSnackBarModule
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
  kycDialogRef: any;

  selectedOtherFile: File | null = null;
  otherDialogRef: any;

  isDragOver: boolean = false;
  isOtherDragOver: boolean = false;

  constructor(private _formBuilder: FormBuilder, 
              private dialog: MatDialog,
              private http: HttpClient,
              private router: Router,
              private snackBar: MatSnackBar) {}

  ngOnInit(): void {

    this.firstFormGroup.get('vehicleType')?.valueChanges.subscribe((value) => {
      const vehicleNumberControl = this.firstFormGroup.get('vehicleNumber');

      if (value === 'none') {
        vehicleNumberControl?.clearValidators();
        vehicleNumberControl?.setValue('');
      } else {
        vehicleNumberControl?.setValidators([Validators.required]);
      }

      vehicleNumberControl?.updateValueAndValidity();
    });

  }

  firstFormGroup = this._formBuilder.group({
    fullName: ['', Validators.required],
    email: ['', Validators.email],
    services: ['', Validators.required],
    organization: ['', Validators.required],
    languages: [[] as string[], Validators.required],
    gender: ['', Validators.required],
    phonePrefix: ['+91', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    vehicleType: ['none'],
    vehicleNumber: [''],
    photo: [null as File | null],
    kycDocument: [null as File | null, Validators.required],
    kycDocType: ['', {
    validators: [Validators.required],
    updateOn: 'blur'
  }]
  });

  secondFormGroup = this._formBuilder.group({
    otherDocument: [null as File | null],
    otherDocType: ['', {
    validators: [Validators.required],
    updateOn: 'blur'
  }]
  });

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

  onFileSelected(event: Event){
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    this.firstFormGroup.get('photo')?.setValue(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        this.photoUrl = result; 
      }
    };
    reader.readAsDataURL(file);
  }
}

  openKycUploadModal(templateRef: any){
    this.kycDialogRef = this.dialog.open(templateRef, {
      width: '600px',
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

  

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        this.selectedKycFile = file;
        this.firstFormGroup.patchValue({ kycDocument: file });
        this.firstFormGroup.get("kycDocument")?.markAsDirty();
      } else {
        this.showErrorToast("Only PDF files are allowed.");
      }
    }
  }

  showErrorToast(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right'
    });
  }

  saveKycFile(){
    if (this.firstFormGroup.get('kycDocType')?.value && this.selectedKycFile) {
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

  deleteKycFile() {
    this.selectedKycFile = null;
    this.firstFormGroup.patchValue({ kycDocument: null });

    const kycInput = document.getElementById('kycInput') as HTMLInputElement;
    if (kycInput) {
      kycInput.value = '';
    }
  }

  isKycInvalid(): boolean {
    const kycDocTypeInvalid =
      this.firstFormGroup.get('kycDocType')?.invalid &&
      this.firstFormGroup.get('kycDocType')?.touched;

    const kycDocumentInvalid =
      this.firstFormGroup.get('kycDocument')?.invalid &&
      this.firstFormGroup.get('kycDocument')?.touched;

    return !!kycDocTypeInvalid || !!kycDocumentInvalid;
  } 

  get kycDocumentControl(): FormControl {
    return this.firstFormGroup.get('kycDocument') as FormControl;
  }

  openOtherUploadModal(templateRef: any): void {
    const control = this.secondFormGroup.get('otherDocument');

    control?.markAsPristine();
    control?.markAsUntouched();

    this.otherDialogRef = this.dialog.open(templateRef, {
      width: '600px',
      disableClose: true
    });
  }

  onOtherDragOver(event: DragEvent) {
    event.preventDefault();
    this.isOtherDragOver = true;
  }

  onOtherDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isOtherDragOver = false;
  }

  onOtherDrop(event: DragEvent) {
    event.preventDefault();
    this.isOtherDragOver = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        this.selectedOtherFile = file;
        this.secondFormGroup.patchValue({ otherDocument: file });
        this.secondFormGroup.get("otherDocument")?.markAsDirty();
      } else {
        this.showErrorToast("Only PDF files are allowed.");
      }
    }
  }

  deleteOtherFile() {
    this.selectedOtherFile = null;
    this.secondFormGroup.patchValue({ otherDocument: null });

    const otherInput = document.getElementById('otherInput') as HTMLInputElement;
    if (otherInput) {
      otherInput.value = '';
    }
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
      // this.otherFile = this.selectedOtherFile;
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
  onStepperSelectionChange(event: StepperSelectionEvent){
  if (event.previouslySelectedIndex !== event.selectedIndex) {
    this.stepper.selectedIndex = event.previouslySelectedIndex;
  }
}

submitForm(): void {
  const formData = new FormData();

  const firstControls = this.firstFormGroup.controls;
  formData.append('fullName', firstControls['fullName'].value ?? '');
  formData.append('email', firstControls['email'].value ?? '');
  formData.append('services', firstControls['services'].value ?? '');
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

  this.http.post<{ message: string; employeeId: string }>('http://localhost:3000/api/helpers', formData).subscribe({
    next: (res) => {

      console.log('Saved!', res);

      this.firstFormGroup.reset();
      this.secondFormGroup.reset();

      this.selectedKycFile = null;
      this.photoUrl = null;

      const fileInputs = ['photoInput', 'kycInput', 'otherInput'];
      fileInputs.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el) el.value = '';
      });
      
      this.stepper.reset();

      const tickDialogRef = this.dialog.open(TickDialogComponent, {
        width: '300px',
        disableClose: true
      });

      setTimeout(() => {
        tickDialogRef.close();

        this.dialog.open(QrDialogComponent, {
          width: '350px',
          data: { employeeId: res.employeeId }
        });
      }, 1500);

      this.router.navigate(['../']);
    },
    error: (err) => console.error('Failed to save', err)
  });
}

  getFileUrl(file: string | File | null | undefined): string {
    if (!file) return '';
    if (typeof file === 'string') {
      return file;
    }
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return '';
  }


  getPhotoUrl(photo: string | File | null | undefined): string {
    if (!photo) return '';
    if (typeof photo === 'string') {
      return 'http://localhost:3000/' + photo;
    }
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    return '';
  }

  getInitials(name: string): string {
    const parts = this.firstFormGroup.get("fullName")?.value?.split(' ') || [];
    return parts.map(p => p[0]).join('').toUpperCase();
  }

  goToNextStep(stepper: MatStepper) {

    this.firstFormGroup.markAllAsTouched();

    if (this.firstFormGroup.valid) {
      stepper.next();
    }
  }


  logging() {
    console.log(this.firstFormGroup.value, this.secondFormGroup.value);
    console.log(this.firstFormGroup.get('photo')?.value)
    this.submitForm();
  }
}
