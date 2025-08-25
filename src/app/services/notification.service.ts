import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  show(message: string, action: string = 'Close', config?: MatSnackBarConfig) {
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      ...config
    });
  }
}
