import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../services/session-storage.service';

interface Feedback {
  feedbackId: number;
  userId: number;
  content: string;
  createdAt: string;
  status: boolean;
}

@Component({
  selector: 'app-feedback',
  styleUrls: ['./feedback.component.css'],
  templateUrl: './feedback.component.html'
})
export class FeedbackComponent implements OnInit {
  feedbackList: Feedback[] = [];
  isLoading = true;
  image!:string;
  constructor(private http: HttpClient, private SessionStorageService: SessionStorageService) {}


  ngOnInit() {
    this.http.get<Feedback[]>('http://localhost:8989/api/feedback').subscribe({
      next: data => {
      console.log(data); // Thêm dòng này để kiểm tra dữ liệu trả về
      this.feedbackList = data;
      this.isLoading = false;
    },
    error: () => {
      this.isLoading = false;
    }
  });
}
    finish() {
    this.ngOnInit();
  }
    logout() {
    this.SessionStorageService.deleteSession();
    window.location.href = '/login';
  }
  changeStatus(feedbackId: number, status: boolean) {
    this.http.put(`http://localhost:8989/api/feedback/${feedbackId}/status`, null, {
      params: { status }
    }).subscribe({
      next: () => {
        // Cập nhật lại danh sách nếu cần
        this.ngOnInit();
      }
    });
  }
}
