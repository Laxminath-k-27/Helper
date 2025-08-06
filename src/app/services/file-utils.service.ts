import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class FileUtilsService {
  constructor(private http: HttpClient) {}

  // file URL to a File object
  loadFileAsFile(url: string): Observable<File> {
    const fileName = url.split('/').pop() || 'file';
    console.log(fileName);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => new File([blob], fileName, { type: blob.type }))
    );
  }

  // image URL to Base64
  loadPhotoAsBase64(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      switchMap(blob => new Observable<string>((observer) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          observer.next(reader.result as string);
          observer.complete();
        };
        reader.onerror = () => observer.error('Failed to convert to Base64');
        reader.readAsDataURL(blob);
      }))
    );
  }
}
