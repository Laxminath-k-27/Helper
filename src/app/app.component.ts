import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ListServiceService } from './services/list-service.service';
import { filter } from 'rxjs/operators';
import {MatDividerModule} from '@angular/material/divider'
import { MatIcon } from '@angular/material/icon';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, 
              RouterLink, 
              NgIf, 
              NgFor,
              MatDividerModule,
              MatIcon],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
    title = 'HelperModule';
    helpers : any [] = []
    selectedHelper: any;

    constructor(public router: Router,
                private listService: ListServiceService ){}


    ngOnInit(){
      this.fetchHelpers();
      
      // this event runs regardless of ngOnIni
      this.router.events    // observable stream
      .pipe(    // to apply operators to the stream
        filter(event => event instanceof NavigationEnd)   // normal filter for checking whether event is the NavigationEnd instance
      ).subscribe(() => {
        if (!this.isAddHelperRoute()) {
          this.fetchHelpers();
        }
      });
    }

    fetchHelpers(){
      this.listService.getAllHelpers().subscribe(data=>{
        console.log(data);
        this.helpers=data;
      });
    }

    isAddHelperRoute(){
      return this.router.url.includes('/add-helper')
    }

    onClick(employedId: string){
      console.log(employedId)
      if(employedId){
        this.listService.getHelperById(employedId).subscribe(data => {
          this.selectedHelper=data.data[0]
          console.log(this.selectedHelper)
        })
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

}
