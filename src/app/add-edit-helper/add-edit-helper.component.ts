import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe, NgFor, NgIf  } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';

import { MatOption, MatPseudoCheckbox } from '@angular/material/core';
import { MatStepperModule,MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule} from '@angular/material/select';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';

import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';

import { QRCodeModule } from 'angularx-qrcode';
import { startWith } from 'rxjs';

import { TickDialogComponent } from '../tick-dialog/tick-dialog.component';
import { QrDialogComponent } from '../qr-dialog/qr-dialog.component';

import { ListServiceService } from '../services/list-service.service';
import { FileUtilsService } from '../services/file-utils.service';


@Component({
  selector: 'app-add-edit-helper',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CommonModule,
    DecimalPipe,
    HttpClientModule,
    FormsModule, 
    ReactiveFormsModule,

    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatOption,
    MatPseudoCheckbox,

    QRCodeModule,

    TickDialogComponent,
    QrDialogComponent,
  ],
  templateUrl: './add-edit-helper.component.html',
  styleUrl: './add-edit-helper.component.scss'
})

export class AddEditHelperComponent implements OnInit{

  servicesList: string[] = ['Maid','Cook','Driver','Electrician','Plumber','Gardener','Painter','Carpenter','Mechanic'];
  languagesList: string[] = ['Hindi', 'English', 'Telugu', 'Tamil', 'Marathi'];
  phonePrefixes: string[] = ['+91', '+1', '+44', '+61', '+81'];
  vehicleTypes: string[] = ['none', 'Bike', 'Car', 'Auto'];
  documentTypes = ['Aadhar', 'Voter ID', 'Passport', 'PAN Card'];

  @ViewChild('stepper') stepper!: MatStepper; // a
  @ViewChild('kycDialog') kycDialogTemplate!: any;  // a

  photoUrl: String | null = null;

  helperData: any;  //d

  kycDialogRef: MatDialogRef<any> | null = null;
  selectedKycFile: File | null = null; // a
  // kycFile: File | null = null; // d

  otherDialogRef: MatDialogRef<any> | null = null;
  selectedOtherFile: File | null = null; // a
  // otherFile: File | null = null; // d 

  isDragOver: boolean = false; // a
  isOtherDragOver: boolean = false; // a

  activeForm = 'form1'  // d
  id: string = '';  // d

  mode: string | null = null;

  selectedIndex: number = 0;

  constructor(private _formBuilder: FormBuilder, 
              private dialog: MatDialog,
              private http: HttpClient,
              private router: Router,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private listService: ListServiceService,
              public fb: FormBuilder,
              private fileutils: FileUtilsService) {}

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get('mode'); // "add"
      console.log('Mode:', this.mode);
    });

    // a
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

    // d
    this.id = this.route.snapshot.paramMap.get('id') || '';

    console.log(this.id)

    this.listService.getHelperById(this.id).subscribe(data => {
      this.helperData=data.data[0];
      console.log(this.helperData);
      if(this.mode === 'edit'){
        console.log('Edit mode activated');
      }
      this.createForm(this.helperData)
    })

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
    kycDocType: ['', { validators: [Validators.required], updateOn: 'blur' }]
  });

  secondFormGroup = this._formBuilder.group({
    otherDocument: [null as File | null],
    otherDocType: ['', {
    validators: [],
    updateOn: 'blur'
  }]
  });

  details() {
    this.selectedIndex = 0;
    console.log('Details form selected');
  }

  otherDetails() {
    this.selectedIndex = 1;
    console.log('Other details form selected');
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
    const tempfile = (event.target as HTMLInputElement).files?.[0];
    if (tempfile && tempfile.type === 'application/pdf') {
      this.selectedKycFile = tempfile;
      this.firstFormGroup.get('kycDocument')?.setValue(tempfile);
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
      this.kycDialogRef?.close();
    }
  }

  cancelKycFile(): void {
    this.selectedKycFile = null;
    this.firstFormGroup.patchValue({
      kycDocument: null,
      kycDocType: ''
    });
    this.kycDialogRef?.close();
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
      this.otherDialogRef?.close();
    }
  }

  cancelOtherFile(): void {
    this.selectedOtherFile = null;
    this.secondFormGroup.patchValue({
      otherDocument: null,
      otherDocType: ''
    });
    console.log(this.secondFormGroup.value);
    this.otherDialogRef?.close();
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
      this.selectedIndex = 1
      stepper.selectedIndex = 1;
    }
  }

  editSubmitCheck(){
    this.firstFormGroup.markAllAsTouched();
    this.secondFormGroup.markAllAsTouched();

    if(this.firstFormGroup.valid && this.secondFormGroup.valid){
      this.logging();
    }
  }

  logging() {
    console.log(this.firstFormGroup.value, this.secondFormGroup.value);
    console.log(this.firstFormGroup.get('photo')?.value);

    this.submitForm();
  }



submitForm(): void {

  if(this.mode === 'add'){


    const formData = new FormData();

    if(this.firstFormGroup.get('vehicleType')?.value === 'none'){
      this.firstFormGroup.patchValue({ vehicleNumber: ' ' });
    }

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



  }else{


    const formData = new FormData();

    if(this.firstFormGroup.get('vehicleType')?.value === 'none'){
      this.firstFormGroup.patchValue({ vehicleNumber: ' '})
    }

    const formControls = this.firstFormGroup.controls;
    formData.append('fullName', formControls['fullName'].value ?? '');
    formData.append('email', formControls['email'].value ?? '');
    formData.append('services', formControls['services'].value ?? '');
    formData.append('organization', formControls['organization'].value ?? '');
    formData.append('languages', JSON.stringify(formControls['languages'].value ?? []));
    formData.append('gender', formControls['gender'].value ?? '');
    formData.append('phonePrefix', formControls['phonePrefix'].value ?? '');
    formData.append('phoneNumber', formControls['phoneNumber'].value ?? '');
    formData.append('vehicleType', formControls['vehicleType'].value ?? '');
    formData.append('vehicleNumber', formControls['vehicleNumber'].value ?? '');
    formData.append('kycDocType', formControls['kycDocType'].value ?? '');
    
    
    const otherFormControls = this.secondFormGroup.controls;
    formData.append('otherDocType', otherFormControls['otherDocType'].value ?? ''); 


    const photoFile = formControls['photo'].value;
    if (photoFile) formData.append('photo', photoFile);

    const kycFile = formControls['kycDocument'].value;
    if (kycFile) formData.append('kycDocument', kycFile);

    const otherFile = otherFormControls['otherDocument'].value;
    if (otherFile) formData.append('otherDocument', otherFile);
    else formData.append('otherDocument', '');


    console.log(this.firstFormGroup.value)
    console.log(this.secondFormGroup.value)


    this.http.patch(`http://localhost:3000/api/helpers/${this.id}`, formData).subscribe({
      next: (res: any) => {
        console.log('Updated!', res);

        this.firstFormGroup.reset();
        this.secondFormGroup.reset();

        this.selectedKycFile = null;
        this.photoUrl = '';

        const fileInputs = ['photoInput', 'kycInput', 'otherInput'];
        fileInputs.forEach((id) => {
          const el = document.getElementById(id) as HTMLInputElement;
          if (el) el.value = '';
        });

        this.router.navigate(['../'], { state: { showToast: true } });
      },
      error: (err: any) => console.error('Failed to update', err)
    });
  }
  
}


  createForm(helper: any){

    this.firstFormGroup.patchValue({
      fullName: helper.fullName,
      email: helper.email,
      services: helper.services,
      organization: helper.organization,
      languages: helper.languages,
      gender: helper.gender,
      phonePrefix: helper.phonePrefix,
      phoneNumber: helper.phoneNumber,
      vehicleType: helper.vehicleType,
      vehicleNumber: helper.vehicleNumber,
      photo: helper.photo || null, // keep as string for display; file upload is handled separately
      kycDocument: helper.kycDocument || null,
      kycDocType: helper.kycDocType
    });

    this.secondFormGroup.patchValue({
      otherDocument: helper.otherDocument || null,
      otherDocType: helper.otherDocType
    });

    const vehicleTypeControl = this.firstFormGroup.get('vehicleType');
    const vehicleNumberControl = this.firstFormGroup.get('vehicleNumber');

    vehicleTypeControl?.valueChanges.pipe(startWith(vehicleTypeControl.value)).subscribe(value => {
        if (value && value !== 'none') {
          vehicleNumberControl?.setValidators([Validators.required]);
        } else {
          vehicleNumberControl?.clearValidators();
          vehicleNumberControl?.setValue('');
        }
        vehicleNumberControl?.updateValueAndValidity();
    });

    this.loadHelperData(helper);
  }

  loadHelperData(helper: any): void {
    const BASE_URL = 'http://localhost:3000/';

    const makeFullUrl = (path: string): string => {
      return path.startsWith('http') ? path : `${BASE_URL}${path}`;
    };

    console.log('KYC Path from backend:', helper.kycDocument);

    if (helper.kycDocument) {
      const kycUrl = makeFullUrl(helper.kycDocument);
      this.fileutils.loadFileAsFile(kycUrl).subscribe(file => {
        this.selectedKycFile = file;
        console.log('KYC File loaded:', this.selectedKycFile);
      });
    }

    if (helper.otherDocument) {
      const otherUrl = makeFullUrl(helper.otherDocument);
      this.fileutils.loadFileAsFile(otherUrl).subscribe(file => {
        this.selectedOtherFile = file;
        console.log('Other File loaded:', this.selectedOtherFile);
      });
    }

    if (helper.photo) {
      const PhotoUrl = makeFullUrl(helper.photo);
      this.fileutils.loadPhotoAsBase64(PhotoUrl).subscribe(base64 => {
        this.photoUrl = base64;
        console.log('Photo (Base64) loaded');
      });
    }
  }
}






//   submitForm(): void {
//     const formData = new FormData();

//     if(this.form.get('vehicleType')?.value === 'none'){
//       this.form.patchValue({ vehicleNumber: ' '})
//     }

//     const formControls = this.form.controls;
//     formData.append('fullName', formControls['fullName'].value ?? '');
//     formData.append('email', formControls['email'].value ?? '');
//     formData.append('services', formControls['services'].value ?? '');
//     formData.append('organization', formControls['organization'].value ?? '');
//     formData.append('languages', JSON.stringify(formControls['languages'].value ?? []));
//     formData.append('gender', formControls['gender'].value ?? '');
//     formData.append('phonePrefix', formControls['phonePrefix'].value ?? '');
//     formData.append('phoneNumber', formControls['phoneNumber'].value ?? '');
//     formData.append('vehicleType', formControls['vehicleType'].value ?? '');
//     formData.append('vehicleNumber', formControls['vehicleNumber'].value ?? '');
//     formData.append('kycDocType', formControls['kycDocType'].value ?? '');
//     formData.append('otherDocType', formControls['otherDocType'].value ?? ''); 
    
//     const photoFile = formControls['photo'].value;
//     if (photoFile) formData.append('photo', photoFile);

//     const kycFile = formControls['kycDocument'].value;
//     if (kycFile) formData.append('kycDocument', kycFile);

//     const otherFile = formControls['otherDocument'].value;
//     if (otherFile) formData.append('otherDocument', otherFile);

//     console.log(this.form.value)

//     this.http.patch(`http://localhost:3000/api/helpers/${this.id}`, formData).subscribe({
//       next: (res: any) => {
//         console.log('Updated!', res);

//         this.form.reset();

//         this.kycFile = null;
//         this.delPhotoUrl = '';

//         const fileInputs = ['photoInput', 'kycInput', 'otherInput'];
//         fileInputs.forEach((id) => {
//           const el = document.getElementById(id) as HTMLInputElement;
//           if (el) el.value = '';
//         });

//         this.router.navigate(['../'], { state: { showToast: true } });
//       },
//       error: (err: any) => console.error('Failed to update', err)
//     });

//   }


