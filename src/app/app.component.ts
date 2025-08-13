import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ListServiceService } from './services/list-service.service';
import { filter } from 'rxjs/operators';
import { MatDividerModule } from '@angular/material/divider'
import { MatIcon } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule} from '@angular/material/menu'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeleteSuccessDialogComponent } from './delete-success-dialog/delete-success-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, 
              RouterLink,
              ReactiveFormsModule,
              NgIf, 
              NgFor,
              MatDividerModule,
              MatIcon,
              MatToolbarModule,
              MatSelectModule,
              MatCardModule,
              FormsModule,
              MatInputModule,
              MatIconModule,
              MatButtonModule,
              MatMenuModule,
              MatCheckboxModule,
              MatFormFieldModule,
              MatOptionModule,
              MatSnackBarModule,
              DeleteSuccessDialogComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
    title = 'HelperModule';

    helpers : any [] = []

    selectedHelper: any = null;
    searchQuery: string = '';
    totalHelperCount: number = 0;
    gotTotalHelpers: boolean = false;
    helperCount: number = 0;
    showCount: boolean = false;

    sortBy= new FormControl();
    filterBy = new FormControl();

    organizationsList: string[] = ['ASBL', 'Spring Helpers'];
    servicesList: string[] = ['Maid','Cook','Driver','Electrician','Plumber','Gardener','Painter','Carpenter','Mechanic'];

    organizationFilter: FormControl<string[] | null> = new FormControl<string[]>([]);
    serviceFilter: FormControl<string[] | null> = new FormControl<string[]>([]);

    constructor(public router: Router,
                private listService: ListServiceService,
                private snackBar: MatSnackBar,
                private dialog: MatDialog ){}


    ngOnInit(){

      this.getTotalHelperCount()

      // this.fetchHelpers();
      this.checkToast(window.history.state);

      // this event runs regardless of ngOnInit
      this.router.events    // observable stream
      .pipe(    // to apply operators to the stream
        filter(event => event instanceof NavigationEnd)   // normal filter for checking whether event is the NavigationEnd instance
      ).subscribe(() => {
        if (!this.isOtherRoute()) {
          this.reserAllFilters();

          this.fetchHelpers();
          // this.onClick(this.helpers[0].employedId)
        }

        this.checkToast(window.history.state);
      });

    }

    reserAllFilters() {
      this.searchQuery = '';
      this.gotTotalHelpers = false;
      this.showCount = false;
      this.helperCount = 0;
      this.serviceFilter.setValue([]);
      this.organizationFilter.setValue([]);
    }

    checkToast(state: any) {
      if (state.showToast) {
        this.showSuccessToast('Helper updated successfully!');

        window.history.replaceState({}, '', this.router.url);
      }
    }

    showSuccessToast(message: string) {
      this.snackBar.open(message, 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'right'
      });
    }

    getTotalHelperCount(){
      this.fetchHelpers();
    }

    fetchHelpers(){
      this.listService.getAllHelpers().subscribe(data=>{
        console.log(data);
        this.helpers=data;
        console.log(this.helpers[0].employeeId)
        this.onClick(this.helpers[0].employeeId)

        if(!this.gotTotalHelpers){
          this.totalHelperCount = this.helpers.length
          this.gotTotalHelpers = true;
        }
      });
    }

    fetchBySearch(){
      if(this.searchQuery){
        this.listService.getHelpersBySearch(this.searchQuery).subscribe(data => {
          this.helpers = data;
          console.log("setch "+this.helpers[0])
          if(this.helpers.length > 0){
            this.onClick(this.helpers[0].employeeId);
          }else{
            this.noHelpers();
          }
        })
        this.showCount = true;
      }else{
        this.reserAllFilters();
        this.fetchHelpers()
        this.showCount = false;
      }
    }

    isOtherRoute(){
      // return this.router.url.includes('/add-helper') || this.router.url.includes('/edit-helper');
      return this.router.url !== '/'
    }

    onClick(employedId: string){
      console.log(employedId)
      if(employedId){
        this.listService.getHelperById(employedId).subscribe(data => {
          this.selectedHelper=data.data[0]
          console.log("from onClick "+this.selectedHelper)
          this.helperCount = this.helpers.length
        })
      }
    }

    noHelpers(){
      this.selectedHelper = null;
      this.helperCount = 0;
    }

    sortHelpers(criterion: 'name' | 'employeeId' ) {
      if (criterion === 'name') {
        this.helpers.sort((a, b) =>
          a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase())
        );
        this.onClick(this.helpers[0].employeeId);
      } else if (criterion === 'employeeId') {
        this.helpers.sort((a, b) =>{
          const idA = parseInt(a.employeeId.replace(/\D/g, ''));
          const idB = parseInt(b.employeeId.replace(/\D/g, ''));
          // console.log(idA, idB)
          return idA - idB;
        })
        console.log(this.helpers)
        console.log(this.helpers[0].employeeId)
        this.onClick(this.helpers[0].employeeId);
      }
    }

    areAllServicesSelected(): boolean {
      const selected = this.serviceFilter?.value || [];
      return this.servicesList.every(service => selected.includes(service));
    }

    areServicesIndeterminate(): boolean {
      const selected = this.serviceFilter?.value || [];
      return selected.length > 0 && !this.areAllServicesSelected();
    }

    toggleSelectAllServices(event: any): void {
      if (event.checked) {
        console.log("selecting all services")
        this.serviceFilter.setValue( [...this.servicesList] );
      } else {
        this.serviceFilter.setValue( [] );
      }
      console.log(this.serviceFilter)
    }

    filterHelpersByServiceChange(event: MatSelectChange) {
      this.serviceFilter.setValue( event.value );
    }

    filterHelpersByOrganizationChange(event: MatSelectChange){
      this.organizationFilter.setValue(event.value || []);
    }

    areAllOrganizationsSelected(): boolean {
      return this.organizationsList.every(lang => 
        this.organizationFilter.value && this.organizationFilter.value.includes(lang));
    }

    areOrganizationsIndeterminate(): boolean {
      const selected = this.organizationFilter.value || [];
      return selected.length > 0 && !this.areAllOrganizationsSelected();
    }

    toggleSelectAllOrganizations(event: any): void {
      if (event.checked) {
        this.organizationFilter.setValue([...this.organizationsList]);
      } else {
        this.organizationFilter.setValue([]);
      }
    }


    applyFilter() {
      const ser = this.serviceFilter.value || [];
      const org = this.organizationFilter.value || [];

      this.listService.getHelpersByFilter(ser, org).subscribe(data => {
        this.helpers = data;

        if (this.helpers.length > 0) {
          console.log(this.helpers);
          this.onClick(this.helpers[0].employeeId);
        } else {
          this.noHelpers();
        }
        if(ser.length > 0 || org.length > 0) this.showCount = true;
        else this.showCount = false;
      });
    }

    getInitials(name: string): string {
      const parts = name.split(' ');
      return parts.map(p => p[0]).join('').toUpperCase();
    }

    getFileUrl(path: string): string {
      return 'http://localhost:3000/' + path;
    }

    getPhotoUrl(path: string): string{
      return 'http://localhost:3000/' + path;
    }

    formatDate(dateStr: string): string {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    deleteHelper(employedId: string) {
      const confirmDialogRef = this.dialog.open(DeleteSuccessDialogComponent, {
        width: '650px',
        height: '200px',
        disableClose: true,
        data: { message: `Delete ${this.selectedHelper.fullName}?` }
      });

      confirmDialogRef.afterClosed().subscribe(result => {
        if(result) {

          this.listService.deleteHelper(employedId).subscribe(res => {
            const ret = res.message.split(' ');
            if (ret[0] === 'true' && ret[1] === 'true') {
              this.selectedHelper= null;
              this.fetchHelpers();

              this.showSuccessToast('Helper deleted successfully!');
            }
          });
        }
      })
    }

    clicked(){
      console.log("clicked")
    }

}
