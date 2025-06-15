import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/common/Customer';
import { Order } from 'src/app/common/Order';
import { CustomerService } from 'src/app/services/customer.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { OrdersService } from 'src/app/services/orders.service';
import { SendmailService } from 'src/app/services/sendmail.service';
import Swal from 'sweetalert2';
import { FavoriteService } from 'src/app/services/favorite.service';
import { Favorite } from 'src/app/common/Favorite';
import { CartService } from 'src/app/services/cart.service';
import { CartDetail } from 'src/app/common/CartDetail';
import { Cart } from 'src/app/common/Cart';
import { Product } from 'src/app/common/Product';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  customer!: Customer;
  customerId!: number;
  favoritePage: number = 1;
  favoritePageSize: number = 4;
  isLoadingOrder = true;

  order!: Order;
  orders!: Order[];
  listOrder = new MatTableDataSource<Order>([]); // hoặc kiểu dữ liệu bạn dùng
  orderLength = 0; // tổng số đơn hàng
  columns: string[] = ['id', 'amount', 'address', 'phone', 'orderDate', 'status', 'view', 'action'];

  user!: Customer;
  favorites: Favorite[] = [];
  favoriteProducts: any[] = [];

  tab: string = 'profile';

  cart!: Cart;
  cartDetails: CartDetail[] = [];
  cartDetail!: CartDetail;

  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  showOldPassword: boolean = false;
  showNewPassword: boolean = false;

  feedbackContent: string = '';
  feedbackSuccess: string = '';
  feedbackError: string = '';

  userFeedbacks: any[] = [];

  orderStatusFilter: string = '';
  filteredOrders: Order[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private customerService: CustomerService, private toastr: ToastrService, private orderService: OrdersService,
    private localStorageService: LocalStorageService, private router: Router, private sendmailService: SendmailService, private favoriteService: FavoriteService,
    private cartService: CartService) { }

  ngOnInit(): void {
    this.checkLogin();
  }

  checkLogin() {
    this.user = this.localStorageService.getUser();
    if (this.user != null) {
      this.customerId = this.user.userId;
      this.getCustomer();
      this.getOrder();
      this.getFavorites();
      this.loadUserFeedbacks();
    } else {
      this.router.navigate(['/login']);
    }
  }

  getFavorites() {
    this.favoriteService.getByUser(this.customerId).subscribe(data => {
      this.favorites = data;
      this.favoriteProducts = this.favorites.map(fav => fav.product);
    });
  }

  getCustomer() {
    this.customerService.getOne(this.customerId).subscribe(data => {
      this.customer = data as Customer;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  applyOrderStatusFilter() {
    if (!this.orderStatusFilter) {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(o => o.status == +this.orderStatusFilter);
    }
    this.listOrder = new MatTableDataSource<Order>(this.filteredOrders);
    this.listOrder.sort = this.sort;
    this.listOrder.paginator = this.paginator;
  }

  getOrder() {
    this.orderService.getByUser(this.customerId).subscribe(data => {
      this.orders = data as Order[];
      this.orderLength = this.orders.length;
      this.applyOrderStatusFilter();
      this.isLoadingOrder = false;
    }, error => {
      this.isLoadingOrder = false;
    })
  }

  cancel(orderId: number) {
    Swal.fire({
      title: 'Bạn có muốn gửi yêu cầu hủy đơn hàng này?',
      text: 'Yêu cầu của bạn sẽ được admin xem xét',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Không',
      confirmButtonText: 'Gửi yêu cầu'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.requestCancelOrder(orderId).subscribe({
          next: (data) => {
            this.toastr.success('Đã gửi yêu cầu hủy đơn hàng!', 'Hệ thống');
            this.sendmailService.sendMailOrder(data as Order).subscribe();
            this.ngOnInit();
          },
          error: (error) => {
            const errorMessage = error?.error || 'Có lỗi xảy ra khi gửi yêu cầu.';
            this.toastr.error(errorMessage, 'Hệ thống');
          }
        });
      }
    });
  }

  confirmReceived(orderId: number) {
    Swal.fire({
      title: 'Xác nhận đã nhận được hàng?',
      text: 'Bạn xác nhận đã nhận được đơn hàng này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonText: 'Chưa',
      confirmButtonText: 'Đã nhận'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.confirmReceived(orderId).subscribe({
          next: () => {
            this.toastr.success('Cảm ơn bạn đã xác nhận! Đơn hàng đã được cập nhật.');
            this.ngOnInit();
          },
          error: () => {
            this.toastr.error('Có lỗi xảy ra, vui lòng thử lại!');
          }
        });
      }
    });
  }

  finish() {
    this.ngOnInit();
  }

  logout() {
    this.localStorageService.logout();
    window.location.href = '/';
  }

  addCart(productId: number, price: number) {
    this.user = this.localStorageService.getUser();
    if (this.user != null) {
      this.cartService.getCart(this.user.userId).subscribe(data => {
        this.cart = data as Cart;
        this.cartDetail = new CartDetail(0, 1, price, new Product(productId), new Cart(this.cart.id));
        this.cartService.postDetail(this.cartDetail).subscribe(data => {
          this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
          this.cartService.getAllDetail(this.cart.id).subscribe(data => {
            this.cartDetails = data as CartDetail[];
            this.cartService.setData(this.cartDetails.length);
          });
        }, error => {
          this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
          this.router.navigate(['/home-page']);
        });
      }, error => {
        this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
        this.router.navigate(['/home-page']);
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.toastr.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (this.newPassword.length < 8) {
      this.toastr.error('Mật khẩu mới phải có ít nhất 8 ký tự!');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Mật khẩu mới không khớp!');
      return;
    }
    const req = {
      email: this.customer.email,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };
    this.customerService.changePassword(req).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.toastr.success(res.message || 'Đổi mật khẩu thành công!');
        } else {
          this.toastr.warning(res.message || 'Thao tác thành công nhưng có cảnh báo');
        }
        this.resetForm();
      },
      error: (err) => {
        if (err.status === 409) {
          this.toastr.success('Mật khẩu đã được cập nhật nhưng có xung đột nhỏ');
          this.resetForm();
        } else {
          this.toastr.error(err.error?.message || 'Đổi mật khẩu thất bại!');
        }
      }
    });
  }

  resetForm() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  sendFeedback() {
    if (!this.feedbackContent.trim()) {
      this.feedbackError = 'Vui lòng nhập nội dung góp ý!';
      this.feedbackSuccess = '';
      return;
    }
    this.feedbackError = '';
    this.feedbackSuccess = '';
    this.customerService.sendFeedback(this.customerId, this.feedbackContent).subscribe({
      next: () => {
        this.feedbackSuccess = 'Gửi góp ý thành công! Cảm ơn bạn đã phản hồi.';
        this.feedbackContent = '';
        this.loadUserFeedbacks();
      },
      error: () => {
        this.feedbackError = 'Gửi góp ý thất bại. Vui lòng thử lại!';
      }
    });
  }

  loadUserFeedbacks() {
    this.customerService.getFeedbackByUser(this.customerId).subscribe({
      next: (data: any) => this.userFeedbacks = data,
      error: () => this.userFeedbacks = []
    });
  }

  deleteFeedback(feedbackId: number) {
    if (confirm('Bạn có chắc muốn xóa góp ý này?')) {
      this.customerService.deleteFeedback(feedbackId, this.customerId).subscribe({
        next: () => {
          this.toastr.success('Đã xóa góp ý!');
          this.loadUserFeedbacks();
        },
        error: () => this.toastr.error('Xóa góp ý thất bại!')
      });
    }
  }

  removeFavorite(productId: number) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi yêu thích?')) {
      this.favoriteService.removeFavorite(this.customerId, productId).subscribe({
        next: () => {
          this.toastr.success('Đã xóa khỏi yêu thích!');
          this.getFavorites(); // Cập nhật lại danh sách yêu thích
        },
        error: () => {
          this.toastr.error('Xóa sản phẩm yêu thích thất bại!');
        }
      });
    }
  }

}
