import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Order } from 'src/app/common/Order';
import { OrderDetail } from 'src/app/common/OrderDetail';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { OrdersService } from 'src/app/services/orders.service';
import { SendmailService } from 'src/app/services/sendmail.service';
import Swal from 'sweetalert2';
import { GhnService } from 'src/app/services/ghn.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-carts',
  templateUrl: './carts.component.html',
  styleUrls: ['./carts.component.css']
})
export class CartsComponent implements OnInit {
  confirmForm!: FormGroup;

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  order!: Order;
  orderDetail!: OrderDetail;
  totalItem!: number;
  totalCartItem!: number;
  customerId!: number;
  amount!: number;
  discount!: number;
  amountReal!: number;
  postForm: FormGroup;

  user!: Customer;

  selectedTotal: number = 0;
  selectedDiscount: number = 0;
  selectedCartDetails: CartDetail[] = []; // Thêm dòng này

  provinceList = []; // [{id, name}]
  districtList = []; // [{id, name}]
  wardList = [];     // [{code, name}]
  selectedProvinceId: number | null = null;
  selectedDistrictId: number | null = null;
  selectedWardCode: string | null = null;
  shippingFee: number = 0;

  discountCodeInput: string = '';
  appliedDiscountCode: string = '';
  discountMessage: string = '';
  discountError: string = '';
  discountValue: number = 0;

  availableDiscountCodes: any[] = []; // Danh sách mã giảm giá khả dụng
  publicDiscountCodes: any[] = []; // Danh sách mã giảm giá công khai

  constructor(private cartService: CartService, private toastr: ToastrService, private orderService: OrdersService,
    private localStorageService: LocalStorageService, private router: Router, private sendMailService: SendmailService, private ghnService: GhnService,
    private http: HttpClient) {
    this.postForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      province: new FormControl('', [Validators.required]),
      district: new FormControl('', [Validators.required]),
      ward: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required, Validators.minLength(3)]),
      shippingProvider: new FormControl('GHN', [Validators.required]) // mặc định GHN
    });
  }

  ngOnInit(): void {
    this.checkLogin();
    this.cartService.$data.subscribe(data => {
      this.totalCartItem = data;
    })
    this.initConfirmForm();
    this.loadAvailableDiscountCodes(); // Tải danh sách mã giảm giá khả dụng
    this.loadPublicDiscountCodes(); // Tải danh sách mã giảm giá công khai
  }

  initConfirmForm() {
    // Lấy thông tin user từ localStorage hoặc API
    const user = this.localStorageService.getUser();
    this.confirmForm = new FormGroup({
      name: new FormControl(this.user?.name || '', [Validators.required]),
      email: new FormControl(this.user?.email || '', [Validators.required, Validators.email]),
      phone: new FormControl(this.cart?.phone || '', [Validators.required, Validators.pattern('^[0-9]{9,11}$')]),
      address: new FormControl(this.cart?.address || '', [Validators.required, Validators.minLength(3)]),
      note: new FormControl('')
    });
  }

  checkLogin() {
    this.user = this.localStorageService.getUser();
    if (this.user != null) {
      this.customerId = this.user.userId;
      this.amount = 0;
      this.discount = 0;
      this.amountReal = 0;
      this.getAllItem();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Khi lấy cartDetails, cập nhật selectedTotal và selectedCartDetails
  getAllItem() {
    this.cartService.getCart(this.customerId).subscribe(data => {
      this.cart = data as Cart;
      this.postForm = new FormGroup({
        'address': new FormControl(this.cart.address, [Validators.required, Validators.minLength(3)]),
        'phone': new FormControl(this.cart.phone, [Validators.required])
      })
      this.cartService.getAllDetail(this.cart.id).subscribe(data => {
        this.cartDetails = data as CartDetail[];
        // Sửa đoạn này:
        // this.totalItem = this.cartDetails.length;
        // this.cartService.setData(this.totalItem);

        // Đúng: tổng số lượng sản phẩm
        const totalQuantity = this.cartDetails.reduce((sum, item) => sum + item.quantity, 0);
        this.totalItem = totalQuantity;
        this.cartService.setData(totalQuantity);

        this.amountReal = 0;
        this.amount = 0;
        this.cartDetails.forEach(item => {
          this.amountReal += item.product.price * item.quantity;
          this.amount += item.price;
        });
        this.discount = this.amountReal - this.amount;
        this.cart.amount = this.amount;
        this.cartService.updateCart(this.customerId, this.cart);
        this.updateSelectedTotal();
        this.updateSelectedCartDetails(); // Thêm dòng này
      }, error => {
        this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
      })
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu!' + error.status, 'Hệ thống');
    })
  }

  // Thêm hàm này để cập nhật selectedCartDetails
  updateSelectedCartDetails() {
    if (this.cartDetails) {
      this.selectedCartDetails = this.cartDetails.filter(item => item.selected);
    } else {
      this.selectedCartDetails = [];
    }
  }

  // Cập nhật trạng thái chọn sản phẩm
  toggleSelect(item: CartDetail) {
    item.selected = !item.selected;
    this.cartService.updateSelected(item.id, item.selected).subscribe(() => {
      this.updateSelectedTotal();
      this.updateSelectedCartDetails(); // Thêm dòng này
    });
  }

  // Tính tổng tiền sản phẩm đã chọn
  updateSelectedTotal() {
    this.cartService.getSelectedTotal(this.cart.id).subscribe((total: number) => {
      this.selectedTotal = total;
      this.updateSelectedDiscount();
      this.loadAvailableDiscountCodes();
    });
  }

  updateSelectedDiscount() {
    // Tính tổng giảm giá trên sản phẩm đã chọn
    const selectedItems = this.cartDetails.filter(item => item.selected);
    let discount = 0;
    selectedItems.forEach(item => {
      discount += (item.product.price * item.quantity) - item.price;
    });
    this.selectedDiscount = discount;

  }

  delete(id: number) {
    Swal.fire({
      title: 'Bạn muốn xoá sản phẩm này ra khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Không',
      confirmButtonText: 'Xoá'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.deleteDetail(id).subscribe(data => {
          this.toastr.success('Xoá thành công!', 'Hệ thống');
          this.ngOnInit();
        }, error => {
          this.toastr.error('Xoá thất bại! ' + error.status, 'Hệ thống');
        })
      }
    })

  }

  update(itemId: number, quantity: number) {
    const item = this.cartDetails.find(i => i.id === itemId);
    if (!item) return;
    if (quantity > 5) {
      item.quantity = 5;
      this.toastr.warning('Nếu muốn mua hơn 5 sản phẩm, vui lòng liên hệ hotline: 0344134596 để được tư vấn!', 'Thông báo');
      return;
    }
    if (quantity < 1) {
      item.quantity = 1;
      return;
    }
    item.quantity = quantity;
    this.cartService.getOneDetail(itemId).subscribe(data => {
      this.cartDetail = data as CartDetail;
      this.cartDetail.quantity = quantity;
      this.cartDetail.price = (this.cartDetail.product.price * (1 - this.cartDetail.product.discount / 100)) * quantity;
      this.cartService.updateDetail(this.cartDetail).subscribe(data => {
        this.ngOnInit();
      }, error => {
        this.toastr.error('Lỗi!' + error.status, 'Hệ thống');
      })
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  removeAllItem(onlySelected: boolean = false) {
    this.cartService.getCart(this.customerId).subscribe(data => {
      this.cart = data as Cart;
      this.cartService.getAllDetail(this.cart.id).subscribe(data => {
        this.cartDetails = data as CartDetail[];
        let itemsToDelete = this.cartDetails;
        if (onlySelected) {
          itemsToDelete = this.cartDetails.filter(item => item.selected);
        }
        itemsToDelete.forEach(item => {
          this.cartService.deleteDetail(item.id).subscribe(() => {
            this.ngOnInit();
          }, error => {
            this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
          });
        });
      }, error => {
        this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
      });
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    });
  }

  checkOut() {
    Swal.fire({
      title: 'Bạn có muốn đặt đơn hàng này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Không',
      confirmButtonText: 'Đặt'
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedItems = this.cartDetails.filter(item => item.selected);
        if (selectedItems.length === 0) {
          this.toastr.warning('Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng!', 'Thông báo');
          return;
        }

        const order = new Order(
          0,
          this.selectedTotal, // amount
          this.postForm.value.address,
          this.postForm.value.phone,
          new Date(),
          1,
          new Customer(this.customerId)
        );
        // Add discount fields if needed
        (order as any).discountAmount = this.discountValue;
        (order as any).finalAmount = this.selectedTotal - this.discountValue;
        (order as any).discountCode = this.appliedDiscountCode;

        this.orderService.checkOut(order).subscribe(data => {
          this.order = data as Order;
          //chuyen vao order detail
          selectedItems.forEach(item => {
            this.orderDetail = new OrderDetail(0, item.quantity, item.price, item.product, this.order);
            this.orderService.saveOrderDetail(this.orderDetail).subscribe(data => {
              console.log('done')
            })
          })
          //gui
          // this.sendMailService.sendMailOrder(this.order).subscribe(data=>{
          //   console.log('mail');
          // })
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
         this.removeAllItem(true);
        Swal.fire(
          'Thành công!',
          'Chúc mừng bạn đã đặt hàng thành công.',
          'success'
        )
      }
    })
  }

  checkOutVnpay() {

    Swal.fire({
      title: 'Bạn có muốn đặt đơn hàng này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Không',
      confirmButtonText: 'Đặt'
    }).then((result) => {
      if (result.isConfirmed) {
        this.order = new Order(0, this.amount, this.postForm.value.address, this.postForm.value.phone, new Date(), 1, new Customer(this.customerId));
        this.orderService.checkOut(this.order).subscribe(data => {
          this.order = data as Order;
          console.log("Order", data)
          //chuyen vao order detail
          this.cartDetails.forEach(item => {
            this.orderDetail = new OrderDetail(0, item.quantity, item.price, item.product, this.order);
            this.orderService.saveOrderDetail(this.orderDetail).subscribe(data => {
              console.log('done')
            })

          })

          this.orderService.checkOutVnpay(this.order).subscribe((data: any) => {
            // Redirect to the desired URL
            window.location.href = data?.url || 'https://example.com/default-redirect-url';
          });
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
         this.removeAllItem(true);
        Swal.fire(
          'Thành công!',
          'Quá trình thanh toán VNPay bắt đầu.',
          'success'
        )
      }
    })
  }

  // Kiểm tra đã chọn hết chưa
  isAllSelected(): boolean {
    return this.cartDetails && this.cartDetails.length > 0 && this.cartDetails.every(item => item.selected);
  }

  // Chọn/bỏ chọn tất cả
  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.cartDetails.forEach(item => {
      if (item.selected !== checked) {
        item.selected = checked;
        this.cartService.updateSelected(item.id, checked).subscribe(() => {
          this.updateSelectedTotal();
          this.updateSelectedCartDetails(); // Thêm dòng này
        });
      }
    });
    // Nếu không có sản phẩm nào, vẫn cập nhật tổng
    if (this.cartDetails.length === 0) {
      this.updateSelectedTotal();
      this.updateSelectedCartDetails(); // Thêm dòng này
    }
  }

  openConfirmModal() {
    // Đồng bộ dữ liệu từ postForm sang confirmForm nếu cần
    this.confirmForm.patchValue(this.postForm.value);
    // Mở modal Bootstrap
    const modal = new (window as any).bootstrap.Modal(document.getElementById('confirmOrderModal'));
    modal.show();
  }

  confirmOrderWithType(type: 'normal' | 'vnpay') {
    // Đóng modal
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('confirmOrderModal'));
    modal.hide();
    // Gọi hàm đặt hàng hoặc thanh toán VNPay
    if (type === 'normal') {
      this.checkOut();
    } else {
      this.checkOutVnpay();
    }
  }

  confirmOrder() {
    if (this.confirmForm.invalid) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    // Lấy dữ liệu từ form để tạo đơn hàng
    const { name, email, phone, address, note } = this.confirmForm.value;
    // Gọi hàm đặt hàng, truyền kèm thông tin này
    this.placeOrder(name, email, phone, address, note);
  }

  placeOrder(name: string, email: string, phone: string, address: string, note: string) {
    // Xử lý đặt hàng như cũ, nhưng lấy thông tin từ form
    // Ví dụ:
    this.order = new Order(0, this.amount, address, phone, new Date(), 1, new Customer(this.customerId));
 // nếu có thuộc tính note
    // ...gọi API đặt hàng như cũ...
  }

  onProvinceChange(provinceId: number) {
    this.selectedProvinceId = provinceId;
    // Gọi API lấy danh sách quận/huyện theo provinceId
    // this.districtList = ...
    this.selectedDistrictId = null;
    this.selectedWardCode = null;
    this.shippingFee = 0;
  }

  onDistrictChange(districtId: number) {
    this.selectedDistrictId = districtId;
    // Gọi API lấy danh sách phường/xã theo districtId
    // this.wardList = ...
    this.selectedWardCode = null;
    this.shippingFee = 0;
  }

  onWardChange(wardCode: string) {
    this.selectedWardCode = wardCode;
    this.calculateShippingFee();
  }

  calculateShippingFee() {
    if (!this.selectedDistrictId || !this.selectedWardCode) {
      this.shippingFee = 0;
      return;
    }
    const data = {
      to_district_id: this.selectedDistrictId,
      to_ward_code: this.selectedWardCode,
      weight: this.getTotalWeight() // tự tính tổng khối lượng giỏ hàng
    };
    if (this.postForm.value.shippingProvider === 'GHN') {
      this.ghnService.getShippingFee(data).subscribe((res: any) => {
        this.shippingFee = res.data?.total || 0;
      });
    }
    // Nếu có GHTK thì else if ...
  }

  // Tính tổng khối lượng giỏ hàng
  getTotalWeight(): number {
    if (!this.cartDetails || this.cartDetails.length === 0) {
      return 0;
    }
    // Giả sử mỗi sản phẩm có thuộc tính weight (gram), nếu không có thì mặc định 1000g
    return this.cartDetails.reduce((sum, item) => {
      const weight = item.product.weight ? item.product.weight : 1000;
      return sum + weight * item.quantity;
    }, 0);
  }

  applyDiscountCode() {
    this.discountMessage = '';
    this.discountError = '';
    if (!this.discountCodeInput) {
      this.discountError = 'Vui lòng nhập mã giảm giá!';
      return;
    }
    // Gọi API kiểm tra mã giảm giá
    console.log('orderTotal gửi lên:', this.selectedTotal); // phải là số
    this.http.get<{ discountType: string, discountValue: number }>(`http://localhost:8989/api/discount-codes/check/${this.discountCodeInput}?orderTotal=${this.selectedTotal}`)
      .subscribe(
        (res) => {
          if (res) {
            this.discountValue = res.discountType === 'percent'
              ? this.selectedTotal * res.discountValue / 100
              : res.discountValue;
            this.appliedDiscountCode = this.discountCodeInput; // Lưu lại mã đã áp dụng
            this.discountMessage = `Áp dụng thành công! Giảm ${res.discountType === 'percent' ? res.discountValue + '%' : res.discountValue + '₫'}`;
            this.discountError = '';
            // Cập nhật lại tổng tiền/thành tiền nếu cần
          } else {
            this.discountError = 'Mã giảm giá không hợp lệ hoặc đã hết hạn!';
            this.discountValue = 0;
          }
        },
        err => {
          this.discountError = 'Mã giảm giá không hợp lệ hoặc đã hết hạn!';
          this.discountValue = 0;
        }
      );
  }

  loadAvailableDiscountCodes() {
    this.http.get<any[]>(`http://localhost:8989/api/discount-codes/available?orderTotal=${this.selectedTotal}`)
      .subscribe(data => this.availableDiscountCodes = data);
  }

  loadPublicDiscountCodes() {
    this.http.get<any[]>('/api/discount-codes/public').subscribe(
      codes => this.publicDiscountCodes = codes
    );
  }

  onCartChange() {
    // ... cập nhật selectedTotal ...
    this.loadAvailableDiscountCodes();
  }

  // Khi user bấm "Dùng mã này"
  useDiscountCode(code: string) {
    this.discountCodeInput = code;
    this.applyDiscountCode();
  }

}
