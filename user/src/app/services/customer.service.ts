import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../common/Customer';
import { Login } from '../common/Login';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  url = 'http://localhost:8989/api/users';
  urlAuthentication = 'http://localhost:8989/api';

  constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get(this.url);
  }

  getOne(id: number) {
    return this.httpClient.get(this.url + '/' + id);
  }

  getOneByEmail(email: string) {
    return this.httpClient.get(this.url + '/email/' + email);
  }

  put(id: number, customer: Customer) {
    return this.httpClient.put(this.url + '/' + id, customer);
  }

  login(login: Login) {
    return this.httpClient.post(this.urlAuthentication+'/user/login', login);
  }

  signIn(user: Customer) {
    return this.httpClient.post(this.url, user);
  }

  changePassword(req: { email: string, oldPassword: string, newPassword: string }) {
    return this.httpClient.post(this.url + '/change_password', req);
  }

  sendFeedback(userId: number, content: string) {
    return this.httpClient.post('http://localhost:8989/api/feedback', null, {
      params: { userId, content }
    });
  }

  getFeedbackByUser(userId: number) {
    return this.httpClient.get(`http://localhost:8989/api/feedback/user/${userId}`);
  }

  deleteFeedback(feedbackId: number, userId: number) {
    return this.httpClient.delete(`http://localhost:8989/api/feedback/${feedbackId}`, {
      params: { userId }
    });
  }
}
