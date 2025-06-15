import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subcategory } from '../common/Subcategory';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  private baseUrl = 'http://localhost:8989/api/subcategories';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.baseUrl}`);
  }
}
