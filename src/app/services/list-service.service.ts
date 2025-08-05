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
    return this.http.get<any>(`http://localhost:3000/api/helpers/${employeeId}`);
  }

  deleteHelper(employeeId: string): Observable<any>{
    return this.http.delete<any>(`http://localhost:3000/api/helpers/${employeeId}`)
  }
}
