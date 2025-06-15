import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatResponse } from '../common/Chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8989/api/v1/chatbot'; // Đảm bảo cổng đúng

  constructor(private http: HttpClient) { }

  sendMessage(keyword: string): Observable<ChatResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // Xóa khoảng trắng thừa và mã hóa từ khóa để đảm bảo URL hợp lệ
    const encodedKeyword = encodeURIComponent(keyword.trim());
    console.log('Sending request to:', `${this.apiUrl}/${encodedKeyword}`); // Log URL để kiểm tra
    return this.http.get<ChatResponse>(`${this.apiUrl}/${encodedKeyword}`, { headers });
  }
}
