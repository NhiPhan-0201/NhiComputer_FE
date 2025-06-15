import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { CartService } from 'src/app/services/cart.service';
import { CategoryService } from 'src/app/services/category.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Category } from '../../common/Category';
import { Notification } from 'src/app/common/Notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  categories!: Category[];
  cart!:Cart;
  cartDetails!:CartDetail[];
  totalCartItem!:number;
  customerId!:number;
  notifications: Notification[] = [];
  unreadCount: number = 0;
  user!:Customer;

  constructor(private categoryService: CategoryService, private toastr: ToastrService,
    private cartService: CartService, private localStorageService: LocalStorageService,
    private notificationService: NotificationService, private router: Router) { }

  ngOnInit(): void {
    this.cartService.$data.subscribe(data=>{
      this.totalCartItem = data;
    })
    this.getAll();
    this.getUser();
  }

  getUser() {
    this.user = this.localStorageService.getUser();
    this.customerId = this.user.userId;
    if(this.user==null) {
      this.cartService.setData(0);
    } else {
      this.getTotalCartItem();
      this.loadNotifications();
    }
  }

  logout() {
    this.localStorageService.logout();
    window.location.href = '/login';
  }


  getTotalCartItem() {
    this.cartService.getCart(this.customerId).subscribe(data=>{
      this.cart = data as Cart;
      this.cartService.getAllDetail(this.cart.id).subscribe(data=>{
        this.cartDetails = data as CartDetail[];
        // ĐÚNG: tổng số lượng sản phẩm
        const totalQuantity = this.cartDetails.reduce((sum, item) => sum + item.quantity, 0);
        this.cartService.setData(totalQuantity);
      })
    }, error=>{
      this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
    })
  }

  getAll() {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data as Category[];
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
    })
  }

  loadNotifications() {
    if (!this.user) return;
    this.notificationService.getNotifications(this.user.userId).subscribe(data => {
      this.notifications = data;
      this.unreadCount = this.notifications.filter(n => n.status === 0).length;
    });
  }

 markAsRead(noti: Notification, event?: Event) {
  console.log('Before markAsRead:', noti.status); // Kiểm tra giá trị ban đầu
  this.notificationService.markAsRead(noti.id).subscribe(
    () => {
      console.log('After markAsRead:', noti.status); // Kiểm tra sau khi gọi API
      noti.status = 1;
      this.unreadCount = this.notifications.filter(n => n.status === 0).length;
    },
    (error) => {
      console.error('Error marking as read:', error); // Kiểm tra lỗi từ BE
    }
  );
}
}
