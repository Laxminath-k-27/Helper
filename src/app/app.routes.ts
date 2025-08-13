import { Routes } from '@angular/router';
import { AddHelperComponent } from './add-helper/add-helper.component';
import { EditHelperComponent } from './edit-helper/edit-helper.component';
import { AddEditHelperComponent } from './add-edit-helper/add-edit-helper.component';

export const routes: Routes = [
    { path: "add-helper", component: AddHelperComponent},
    { path: "edit-helper/:id", loadComponent: () => import('./edit-helper/edit-helper.component').then(m => m.EditHelperComponent)},
    { path: "add-edit-helper", component: AddEditHelperComponent },
    { path: "add-edit-helper/:id", loadComponent: () => import('./add-edit-helper/add-edit-helper.component').then(m => m.AddEditHelperComponent)}
];
