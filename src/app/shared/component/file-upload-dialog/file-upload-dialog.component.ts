import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-file-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule
  ],
  templateUrl: './file-upload-dialog.component.html',
  styleUrl: './file-upload-dialog.component.scss'
})

export class FileUploadDialogComponent implements OnInit{
  constructor( private notification: NotificationService){}

  ngOnInit(): void {
    const existingFile = this.docControl?.value;
    console.log(typeof existingFile);
    if (existingFile) {
      this.selectedFile = existingFile;
    }
  }
  @Input() title: string = 'Upload Document';
  @Input() formGroup!: FormGroup;
  @Input() controlName: string = 'kycDocument';
  @Input() controlNameType: string = 'kycDocType';
  @Input() documentTypes: string[] = [];
  @Input() accept: string = 'application/pdf';

  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isDragOver = false;
  selectedFile: File | null = null;


  get control(): FormControl {
    return this.formGroup.get(this.controlNameType) as FormControl;
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
     
    if(event.dataTransfer?.files.length){
      const file = event.dataTransfer?.files[0];
      if (file.type === "application/pdf") {
        this.selectedFile = file;

        this.docControl?.markAsDirty();
        this.docControl?.markAsTouched();
      }else{
        this.notification.show("Only PDF files are allowed.")
      }
    }
    
  }

  onFileChange(event: Event) {  // onKycFileSelected
    const tempFile = (event.target as HTMLInputElement).files?.[0] || null;
    if(tempFile && tempFile.type === 'application/pdf'){
      this.selectedFile = tempFile;
      this.docControl?.markAsUntouched();
    }
  }

  get docControl(): FormControl {
    return this.formGroup.get(this.controlName) as FormControl;
  }

  get docTypeControl(): FormControl {
    return this.formGroup.get(this.controlNameType) as FormControl;
  }

  isDocInvalid(){
    const docInvalid =
      this.docControl?.invalid &&
      (this.docControl?.touched ||
       this.docControl?.dirty )

    return !!docInvalid;
  }

  deleteFile() {
    this.selectedFile = null;
    this.docControl.setValue( null );

    const docInput = document.getElementById('docInput') as HTMLInputElement;
    if(docInput){
      docInput.value = '';
    }
  }

  saveFile() {
    this.docTypeControl?.markAllAsTouched();
    if(!this.selectedFile) this.docControl?.markAllAsTouched();
    if(this.docTypeControl?.value && this.selectedFile){
      this.docControl.setValue(this.selectedFile);
      console.log(this.docControl?.value," ",this.selectedFile);
      this.save.emit();
      this.closeDialog();
    }
  }

  cancelFile(){
    this.selectedFile = null;

    this.docControl.setValue(null);
    this.docTypeControl.setValue('');

    this.docControl?.markAsTouched();
    this.close.emit();
  }

  closeDialog() {
    if((this.docControl?.value === null || this.docTypeControl?.value === '')){
      this.notification.show('Save the File!!!');
    }
    this.close.emit();
  }
}
