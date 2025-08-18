import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { QRCodeModule } from 'angularx-qrcode';
import { Router } from '@angular/router';


@Component({
  selector: 'app-qr-dialog',
  standalone: true,
  imports: [ QRCodeModule,
              MatIcon
  ],
  templateUrl: './qr-dialog.component.html',
  styleUrl: './qr-dialog.component.scss'
})

export class QrDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<QrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router
  ) {}

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  closeDialog(){
    this.dialogRef.close();
  }

}