import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoorCityService {
  private apiUrl = 'https://nominatim.openstreetmap.org/search?format=json';

  constructor(private http: HttpClient) { }

  geocodeAddress(address: string): Observable<any> {
    const encodedAddress = encodeURIComponent(address);
    const url = `${this.apiUrl}&q=${encodedAddress}`;

    return this.http.get(url);
  }
}
