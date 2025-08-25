import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe, NgFor, NgIf  } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute , RouterLink} from '@angular/router';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormControl } from '@angular/forms';

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
import { MatTooltipModule } from '@angular/material/tooltip'

import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';

import { QRCodeModule } from 'angularx-qrcode';
import { startWith } from 'rxjs';

import { TickDialogComponent } from '../tick-dialog/tick-dialog.component';
import { QrDialogComponent } from '../qr-dialog/qr-dialog.component';
import { FileUploadDialogComponent } from '../shared/component/file-upload-dialog/file-upload-dialog.component';

import { ListServiceService } from '../services/list-service.service';
import { FileUtilsService } from '../services/file-utils.service';
import { NotificationService } from '../services/notification.service';
import { MultiSelectWithSelectAllComponent } from '../shared/component/multi-select-with-select-all/multi-select-with-select-all.component';


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
    RouterLink,
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
    MatTooltipModule,

    QRCodeModule,

    TickDialogComponent,
    QrDialogComponent,
    FileUploadDialogComponent,
    MultiSelectWithSelectAllComponent
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

  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('kycDialog') kycDialogTemplate!: any;

  photoUrl: String | null = null;
  photoSizeError: boolean = false;
  photoTypeError: boolean = false;

  helperData: any;

  kycDialogRef: MatDialogRef<any> | null = null;
  selectedKycFile: File | null = null;

  otherDialogRef: MatDialogRef<any> | null = null;
  selectedOtherFile: File | null = null;

  isDragOver: boolean = false;
  isOtherDragOver: boolean = false;

  id: string = '';

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
              private fileutils: FileUtilsService,
              private notification: NotificationService) {}

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      this.mode = params.get('mode');
      console.log('Mode:', this.mode);
    });

    const vehicleTypeControl = this.firstFormGroup.get('vehicleType');
    const vehicleNumberControl = this.firstFormGroup.get('vehicleNumber');

    vehicleTypeControl?.valueChanges
    .pipe(
      startWith(vehicleTypeControl.value)
    ).subscribe(
      value => 
    {
        
      if (value && value !== 'none') {
        vehicleNumberControl?.setValidators([Validators.required]);
      } else {
        vehicleNumberControl?.clearValidators();
        vehicleNumberControl?.setValue('');
      }
      
      vehicleNumberControl?.updateValueAndValidity();
    });

    this.id = this.route.snapshot.paramMap.get('id') || '';

    console.log(this.id)

    if(this.mode === 'edit'){
      this.listService.getHelperById(this.id).subscribe(data => {
        this.helperData=data.data[0];
        console.log(this.helperData);
        if(this.mode === 'edit'){
          console.log('Edit mode activated');
        }
        this.createForm(this.helperData)
      })
    }
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
    photo: [ null as File | null ],
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
      photo: helper.photo || null, 
      kycDocument: helper.kycDocument || null,
      kycDocType: helper.kycDocType
    });

    this.secondFormGroup.patchValue({
      otherDocument: helper.otherDocument || null,
      otherDocType: helper.otherDocType
    });

    console.log(this.firstFormGroup);

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
        this.kycDocumentControl.setValue(file);
        console.log('KYC File loaded:', this.selectedKycFile);
      });
    }

    if (helper.otherDocument) {
      const otherUrl = makeFullUrl(helper.otherDocument);
      this.fileutils.loadFileAsFile(otherUrl).subscribe(file => {
        this.selectedOtherFile = file;
        this.secondFormGroup.get('otherDocument')?.setValue(file);
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

  details() {
    this.selectedIndex = 0;
    console.log('Details form selected');
  }

  get languageControl(): FormControl<string[] | null> {
    return this.firstFormGroup.get('languages')! as FormControl<string[] | null>;
  }

  otherDetails() {
    this.selectedIndex = 1;
    console.log('Other details form selected');
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: Event){
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const MAX_BYTES = 5 * 1024 * 1024;
      const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

      if (file.size > MAX_BYTES) {
        this.firstFormGroup.get('photo')?.setValue(null, { emitEvent: false });
        this.photoUrl = null;
        input.value = '';
        this.photoSizeError = true;
        setTimeout(() => { this.photoSizeError = false; }, 2000);
        
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        this.firstFormGroup.get('photo')?.setValue(null, { emitEvent: false });
        this.photoUrl = null;
        input.value = '';
        this.photoTypeError = true;
        setTimeout( () => { this.photoTypeError = false }, 2000);

        return;
      }

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

  closeKycDialogRef(){
    this.kycDialogRef?.close();
  }

  saveKycFileEmit(){
    this.selectedKycFile = this.kycDocumentControl.value;
  }

  isKycDocInvalid(): boolean {
    const kycDocumentInvalid =
      this.kycDocumentControl?.invalid &&
      (this.kycDocumentControl?.touched ||
       this.kycDocumentControl?.dirty )

    return !!kycDocumentInvalid;
  }

  isKycInvalid(): boolean {
    const kycDocTypeInvalid =
      this.firstFormGroup.get('kycDocType')?.invalid &&
      this.firstFormGroup.get('kycDocType')?.touched;

    return !!kycDocTypeInvalid || this.isKycDocInvalid();
  } 

  get kycDocumentControl(): FormControl {
    return this.firstFormGroup.get('kycDocument') as FormControl;
  }

  get otherDocControl(): FormControl {
    return this.secondFormGroup.get('otherDocument') as FormControl;
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

  saveOtherFileEmit(){
    this.selectedOtherFile = this.secondFormGroup.get('otherDocument')?.value || null;
  }

  closeOtherDialogRef() {
    this.otherDialogRef?.close();
  }

  isOtherDocInvalid(): boolean {
    const otherDocInvalid = 
      this.otherDocControl?.invalid &&
      (this.otherDocControl?.touched ||
        this.otherDocControl?.dirty)

    return !!otherDocInvalid;
  }

  isOtherInvalid(): boolean {
    const otherDocTypeInvalid = 
      this.otherDocControl?.invalid &&
      this.otherDocControl?.touched;

      return !!otherDocTypeInvalid || this.isOtherDocInvalid();
  }

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
    if (photoFile) formData.append('photo', photoFile);

    const kycFile = firstControls['kycDocument'].value;
    if (kycFile) formData.append('kycDocument', kycFile);

    const secondControls = this.secondFormGroup.controls;
    formData.append('otherDocType', secondControls['otherDocType'].value ?? '');

    const otherFile = secondControls['otherDocument'].value;
    if (otherFile) formData.append('otherDocument', otherFile);

    
    
    if(this.mode === 'add'){
      
      this.http.post<any>('http://localhost:3000/api/helpers', formData).subscribe({
        next: (res) => {
          console.log('Saved!', res);

          const tickDialogRef = this.dialog.open(TickDialogComponent, {
            width: '300px',
            disableClose: true
          });

          setTimeout(() => {
            tickDialogRef.close();

            const qrDialogRef = this.dialog.open(QrDialogComponent, {
              width: '820px',
              height: '550px',
              data: { 
                employeeId: res.employeeId,
                organization: res.organization,
                phone: res.phoneNumber,
                joinedDate: res.joinedDate,
                fullName: res.fullName,
                services: res.services,
                photo: this.photoUrl
            }
            });

            qrDialogRef.afterClosed().subscribe(() => {
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

              this.router.navigate(['../']);
            })

          }, 1500);

        },
        error: (err) => console.error('Failed to save', err)
      });

    }else{

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
  
}