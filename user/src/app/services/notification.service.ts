import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../common/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8989/api/notifications';

  constructor(private http: HttpClient) { }

  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${userId}`);
  }

  // Đánh dấu đã đọc
  markAsRead(notificationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read/${notificationId}`, {});
  }
}
