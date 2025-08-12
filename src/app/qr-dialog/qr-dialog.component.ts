import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QRCodeModule } from 'angularx-qrcode';


@Component({
  selector: 'app-qr-dialog',
  standalone: true,
  imports: [ QRCodeModule],
  templateUrl: './qr-dialog.component.html',
  styleUrl: './qr-dialog.component.scss'
})

export class QrDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { employeeId: string }) {}
}