import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ListServiceService } from './services/list-service.service';
import { filter } from 'rxjs/operators';
import { MatDividerModule } from '@angular/material/divider'
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule} from '@angular/material/menu'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, 
              RouterLink, 
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
              MatMenuModule],
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
    sortBy= new FormControl();
    filterBy = new FormControl();
    searchFocused: boolean = false;

    constructor(public router: Router,
                private listService: ListServiceService ){}


    ngOnInit(){

      this.getTotalHelperCount()

      // this.fetchHelpers();
      
      // this event runs regardless of ngOnIni
      this.router.events    // observable stream
      .pipe(    // to apply operators to the stream
        filter(event => event instanceof NavigationEnd)   // normal filter for checking whether event is the NavigationEnd instance
      ).subscribe(() => {
        if (!this.isOtherRoute()) {
          // this.selectedHelper = null;
          this.fetchHelpers();
          // this.onClick(this.helpers[0].employedId)
          
        }
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
      }else{
        this.fetchHelpers()
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

    sortHelpers(criterion: 'name' | 'date') {
      if (criterion === 'name') {
        this.helpers.sort((a, b) =>
          a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase())
        );
        this.onClick(this.helpers[0].employeeId);
      } else if (criterion === 'date') {
        this.helpers.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.onClick(this.helpers[0].employeeId);
      }
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
      this.listService.deleteHelper(employedId).subscribe(res => {
        const ret = res.message.split(' ');
        if (ret[0] === 'true' && ret[1] === 'true') {
          this.selectedHelper= null;
          this.fetchHelpers();
        }
      });
    }

    clicked(){
      console.log("clicked")
    }

}
