import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-delete-success-dialog',
  standalone: true,
  imports: [ MatIcon, MatDivider ],
  templateUrl: './delete-success-dialog.component.html',
  styleUrl: './delete-success-dialog.component.scss'
})

export class DeleteSuccessDialogComponent {
  constructor(public dialogRef: MatDialogRef<DeleteSuccessDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}
