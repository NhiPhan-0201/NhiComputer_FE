import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GhnService {
  private apiUrl = 'http://localhost:8989/api/ghn';

  constructor(private http: HttpClient) {}

  getShippingFee(data: any) {
    return this.http.post(this.apiUrl + '/fee', data);
  }

  createOrder(data: any) {
    return this.http.post(this.apiUrl + '/create-order', data);
  }
}
