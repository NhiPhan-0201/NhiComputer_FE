import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subcategory } from '../common/Subcategory';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  private apiUrl = 'http://localhost:8989/api/subcategories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(this.apiUrl);
  }

  get(id: number): Observable<Subcategory> {
    return this.http.get<Subcategory>(`${this.apiUrl}/${id}`);
  }

  add(subcategory: Subcategory): Observable<Subcategory> {
    return this.http.post<Subcategory>(this.apiUrl, subcategory);
  }

  update(subcategory: Subcategory): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}/${subcategory.subcategoryId}`, subcategory);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
