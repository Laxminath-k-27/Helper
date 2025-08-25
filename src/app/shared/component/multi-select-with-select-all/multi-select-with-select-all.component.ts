import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-multi-select-with-select-all',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './multi-select-with-select-all.component.html',
  styleUrls: ['./multi-select-with-select-all.component.scss']
})

export class MultiSelectWithSelectAllComponent<T> {

  @Input() label: string = 'Select Items';
  @Input() items: string[] = [];
  @Input() errorMessage?: string;
  @Input() control!: FormControl<string[] | null>;


  areAllSelected(): boolean {
    const selected = this.control?.value || [];
    return this.items.every(item => selected.includes(item));
  }

  isIndeterminate(): boolean {
    const selected = this.control?.value || [];
    return  selected.length > 0 &&
            !this.areAllSelected();
  }

  toggleSelectAll(event: any) {
    if (event.checked) {
      this.control.setValue([...this.items]);
    } else {
      this.control.setValue([]);
    }
  }
}

