import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/common/Customer';
import { Login } from 'src/app/common/Login';
import { CustomerService } from 'src/app/services/customer.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  show: boolean = false;
  postForm: FormGroup;
  login!: Login;
  user!: Customer;

  constructor(
    private userService: CustomerService,
    private localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.postForm = new FormGroup({
      'username': new FormControl(null, Validators.required),
      'password': new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {
    this.checkLogin();
  }

  ngAfterViewInit(): void {
    const usernameRef = document.getElementById("username") as HTMLInputElement;
    const passwordRef = document.getElementById("password") as HTMLInputElement;
    const eyeL = document.querySelector(".eyeball-l") as HTMLElement;
    const eyeR = document.querySelector(".eyeball-r") as HTMLElement;
    const handL = document.querySelector(".hand-l") as HTMLElement;
    const handR = document.querySelector(".hand-r") as HTMLElement;

    const normalEyeStyle = () => {
      if (eyeL && eyeR) {
        eyeL.style.cssText = `left:0.6em; top:0.6em;`;
        eyeR.style.cssText = `right:0.6em; top:0.6em;`;
      }
    };

    const normalHandStyle = () => {
      if (handL && handR) {
        handL.style.cssText = `
          height: 3em;
          top: -12em;
          left: 7.5em;
          transform: rotate(0deg);
        `;
        handR.style.cssText = `
          height: 3em;
          top: -12em;
          right: 7.5em;
          transform: rotate(0deg);
        `;
      }
    };

    usernameRef?.addEventListener("focus", () => {
      if (eyeL && eyeR) {
        eyeL.style.cssText = `left: 0.75em; top: 1.12em;`;
        eyeR.style.cssText = `right: 0.75em; top: 1.12em;`;
        normalHandStyle();
      }
    });

    passwordRef?.addEventListener("focus", () => {
      if (handL && handR) {
        handL.style.cssText = `
          height: 5em; /* Giảm chiều cao tay để trông tự nhiên hơn */
          top: -14em; /* Dịch tay lên gần đầu gấu hơn (thay vì xuống dưới) */
          left: 11.75em;
          transform: rotate(-155deg);
        `;
        handR.style.cssText = `
          height: 5em;
          top: -14em;
          right: 11.75em;
          transform: rotate(155deg);
        `;
        normalEyeStyle();
      }
    });

    document.addEventListener("click", (e) => {
      const clickedElem = e.target as HTMLElement;
      if (clickedElem !== usernameRef && clickedElem !== passwordRef) {
        normalEyeStyle();
        normalHandStyle();
      }
    });
  }

  checkLogin() {
    this.user = this.localStorageService.getUser();
    if (this.user != null) {
      this.router.navigate(['/home-page']);
    }
  }

  Login() {
    this.login = this.postForm.value;
    this.userService.login(this.login).subscribe(
      data => {
        this.localStorageService.saveLogin(data as Customer);
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          showConfirmButton: false,
          timer: 1500
        });
        window.location.href = '/';
      },
      error => {
        if (error.status == 404) {
          this.toastr.error('Tài khoản không hợp lệ!', 'Hệ thống');
        } else {
          this.toastr.error('Mật khẩu không đúng!', 'Hệ thống');
        }
      }
    );
  }

  password() {
    this.show = !this.show;
  }
}
