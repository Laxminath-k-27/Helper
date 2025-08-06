import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListServiceService } from '../services/list-service.service';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatFormFieldControl, MatLabel } from '@angular/material/form-field';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatOption, MatPseudoCheckbox } from '@angular/material/core';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FileUtilsService } from '../services/file-utils.service';
import { startWith } from 'rxjs';


@Component({
  selector: 'app-edit-helper',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatIcon,
    MatLabel,
    MatFormField,
    MatCheckbox,
    MatOption,
    MatError,
    MatRadioButton,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    DecimalPipe,
    MatRadioModule,
    MatPseudoCheckbox,
    MatInputModule
  ],
  templateUrl: './edit-helper.component.html',
  styleUrl: './edit-helper.component.scss'
})
export class EditHelperComponent implements OnInit{
  servicesList: string[] = ['Maid','Cook','Driver','Electrician','Plumber','Gardener','Painter','Carpenter','Mechanic'];
  languagesList: string[] = ['Hindi', 'English', 'Telugu', 'Tamil', 'Marathi'];
  phonePrefixes: string[] = ['+91', '+1', '+44', '+61', '+81'];
  vehicleTypes: string[] = ['none', 'Bike', 'Car', 'Auto'];
  documentTypes = ['Aadhar', 'Voter ID', 'Passport', 'PAN Card'];

  photoUrl: string = '';

  helperData: any;
  form!: FormGroup

  kycDialogRef: MatDialogRef<any> | null = null;
  kycFile: File | null = null;

  otherDialogRef: MatDialogRef<any> | null = null;
  otherFile: File | null = null;

  activeForm = 'form1'
  id: string = '';

  constructor(private route: ActivatedRoute,
              private listService: ListServiceService,
              public fb: FormBuilder,
              private dialog: MatDialog,
              private router: Router,
              private http: HttpClient,
              private fileutils: FileUtilsService){
                
  }

  ngOnInit(): void {
      this.id = this.route.snapshot.paramMap.get('id') || '';
      console.log(this.id)
      this.listService.getHelperById(this.id).subscribe(data => {
        this.helperData=data.data[0];
        console.log(this.helperData);
        this.createForm(this.helperData)
      })

      
  }

createForm(helper: any){
  this.form = this.fb.group({
      fullName: [helper.fullName, Validators.required],
      email: [helper.email, [Validators.required, Validators.email]],
      services: [helper.services as string[], Validators.required],
      organization: [helper.organization, Validators.required],
      languages: [helper.languages as string[], Validators.required],
      gender: [helper.gender,Validators.required],
      phonePrefix: [helper.phonePrefix, Validators.required],
      phoneNumber: [helper.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      vehicleType: [helper.vehicleType],
      vehicleNumber: [helper.vehicleNumber],
      photo: [helper.photo],
      kycDocument: [helper.kycDocument, Validators.required],
      kycDocType: [helper.kycDocType, Validators.required],
      otherDocument: [helper.otherDocument],
      otherDocType: [helper.otherDocType]
  });

  const vehicleTypeControl = this.form.get('vehicleType');
  const vehicleNumberControl = this.form.get('vehicleNumber');

  // This logic now handles the initial state and any subsequent changes
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
      this.kycFile = file;
      console.log('KYC File loaded:', this.kycFile);
    });
  }

  if (helper.otherDocument) {
    const otherUrl = makeFullUrl(helper.otherDocument);
    this.fileutils.loadFileAsFile(otherUrl).subscribe(file => {
      this.otherFile = file;
      console.log('Other File loaded:', this.otherFile);
    });
  }

  if (helper.photo) {
    const photoUrl = makeFullUrl(helper.photo);
    this.fileutils.loadPhotoAsBase64(photoUrl).subscribe(base64 => {
      this.photoUrl = base64;
      console.log('Photo (Base64) loaded');
    });
  }
}


  triggerFileInput(fileInput: HTMLInputElement){
    fileInput.click();
  }

  onImageSelected(event: Event){
    const input = event.target as HTMLInputElement;

    if(input.files && input.files.length>0){
      const file = input.files[0];

      this.form.get('photo')?.setValue(file);

      const reader = new FileReader();

      reader.onload = () =>{
        const result = reader.result;
        if(typeof result === 'string'){
          this.photoUrl = result;
        }
      }

      reader.readAsDataURL(file);
    }
  }

  onSelectionChange(event: MatSelectChange){
    this.form.patchValue({ services: event.value })
  }

  isAllSelected(){
    const selected = this.form.get('services')?.value || [];
    return this.servicesList.every(service => selected.includes(service));
  }

  isIntermediate(){
    const selected = this.form.get('services')?.value || [];
    return selected.length > 0 && !this.isAllSelected();
  }

  toggleSelectAllCheckbox(){
    if(!this.isAllSelected()){
      this.form.patchValue({ services: [...this.servicesList]});
    }else{
      this.form.patchValue({ services: [] })
    }
  }

  onLanguageSelectionChange(event: MatSelectChange){
    this.form.patchValue({ languages: event.value })
  }

  areAllLanguagesSelected(){
    const selected = this.form.get('languages')?.value || [];
    return this.languagesList.every(lang => selected.includes(lang));
  }

  areLanguagesIndeterminate(){
    const selected = this.form.get('languages')?.value || [];
    return selected.length > 0 && !this.areAllLanguagesSelected();
  }

  toggleSelectAllLanguages(){
    if(!this.areAllLanguagesSelected()){
      this.form.patchValue({ languages: [...this.languagesList]});
    }else{
      this.form.patchValue({ languages: []});
    }
  }


  


  openKycUploadModal(templateRef: TemplateRef<any>){
    this.kycDialogRef = this.dialog.open(templateRef ,{
      width: '400px',
      disableClose: true
    })
  }

  onKycFileSelected(event: Event){
    const file = (event.target as HTMLInputElement).files?.[0]
    if(file && file.type === 'application/pdf'){
      this.kycFile = file;
      this.form.patchValue({ 
        kycDocument: file, 
      });
    }
  }

  saveKycFile(){
    if(this.form.get('kycDocType')?.value){
      this.kycDialogRef?.close();
    }
  }

  cancelKycFile(){
    this.kycFile = null;
    this.form.patchValue({
      kycDocument: null,
      kycDocType: ''
    })
    this.kycDialogRef?.close();
  }

  openOtherUploadModal(templateRef: TemplateRef<any>){
    this.otherDialogRef = this.dialog.open(templateRef, {
        width: '800px',
        disableClose: true
    })
  }

  onOtherFileSelected(event: Event){
    const file = (event.target as HTMLInputElement).files?.[0];

    if(file){
      this.otherFile = file;
    }

    console.log(this.otherFile);
  }

  cancelOtherFile(){
    this.otherFile = null;
    this.form.patchValue({
      otherDocument: null,
      otherDocType: ''
    })
    this.otherDialogRef?.close();
  }

  saveOtherFile(){
    if(this.otherFile){
      this.form.patchValue({
        otherDocument: this.otherFile
      })
      this.otherDialogRef?.close();
    }
  }

  submitForm(): void {
  const formData = new FormData();

  if(this.form.get('vehicleType')?.value === 'none'){
    this.form.patchValue({ vehicleNumber: ' '})
  }

  const formControls = this.form.controls;
  formData.append('fullName', formControls['fullName'].value ?? '');
  formData.append('email', formControls['email'].value ?? '');
  formData.append('services', JSON.stringify(formControls['services'].value ?? []));
  formData.append('organization', formControls['organization'].value ?? '');
  formData.append('languages', JSON.stringify(formControls['languages'].value ?? []));
  formData.append('gender', formControls['gender'].value ?? '');
  formData.append('phonePrefix', formControls['phonePrefix'].value ?? '');
  formData.append('phoneNumber', formControls['phoneNumber'].value ?? '');
  formData.append('vehicleType', formControls['vehicleType'].value ?? '');
  formData.append('vehicleNumber', formControls['vehicleNumber'].value ?? '');
  formData.append('kycDocType', formControls['kycDocType'].value ?? '');
  formData.append('otherDocType', formControls['otherDocType'].value ?? ''); 
  
  const photoFile = formControls['photo'].value;
  if (photoFile) formData.append('photo', photoFile);

  const kycFile = formControls['kycDocument'].value;
  if (kycFile) formData.append('kycDocument', kycFile);

  const otherFile = formControls['otherDocument'].value;
  if (otherFile) formData.append('otherDocument', otherFile);

  console.log(this.form.value)

  this.http.patch(`http://localhost:3000/api/helpers/${this.id}`, formData).subscribe({
    next: (res: any) => {
      console.log('Updated!', res);

      this.form.reset();

      this.kycFile = null;
      this.photoUrl = '';

      const fileInputs = ['photoInput', 'kycInput', 'otherInput'];
      fileInputs.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el) el.value = '';
      });

      this.router.navigate(['../']);
    },
    error: (err: any) => console.error('Failed to update', err)
  });

}

}
