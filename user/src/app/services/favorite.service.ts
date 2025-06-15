import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorite } from '../common/Favorite';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private apiUrl = 'http://localhost:8989/api/favorites';

  constructor(private http: HttpClient) {}

  getByUser(userId: number): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/user/${userId}`);
  }

  addFavorite(userId: number, productId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}?userId=${userId}&productId=${productId}`, {});
  }

  removeFavorite(userId: number, productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}?userId=${userId}&productId=${productId}`);
  }

  isFavorite(userId: number, productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/is-favorite`, {
      params: { userId: userId.toString(), productId: productId.toString() },
    });
  }
}
