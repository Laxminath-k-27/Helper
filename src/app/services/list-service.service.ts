import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ListServiceService {

  private apiUrl = 'http://localhost:3000/api/helpers'; 

  constructor(private http: HttpClient) {}

  getAllHelpers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getHelperById(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${employeeId}`);
  }

  getHelpersBySearch(searchString: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search/${encodeURIComponent(searchString)}`);
  }

  getHelpersByFilter(services: string[], organizations: string[]): Observable<any[]> {
    
    const params = {
      services: services.join(',') || '',
      organizations: organizations.join(',') || ''
    };
    
    console.log(`${this.apiUrl}/filter`, { params });
    return this.http.get<any[]>(`${this.apiUrl}/filter/helpers`, { params });
  }

  deleteHelper(employeeId: string): Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/${employeeId}`);
  }
}
