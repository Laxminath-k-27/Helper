import { Routes } from '@angular/router';
import { AddHelperComponent } from './add-helper/add-helper.component';
import { EditHelperComponent } from './edit-helper/edit-helper.component';

export const routes: Routes = [
    {path: "add-helper", component: AddHelperComponent},
    {path: "edit-helper/:id", loadComponent: () => import('./edit-helper/edit-helper.component').then(m => m.EditHelperComponent)}
];
