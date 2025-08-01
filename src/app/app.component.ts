import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddHelperComponent } from './add-helper/add-helper.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AddHelperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'HelperModule';
}
