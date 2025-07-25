import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Order } from 'src/app/common/Order';
import { OrderDetail } from 'src/app/common/OrderDetail';
import { OrderService } from 'src/app/services/order.service';
import { SendmailService } from 'src/app/services/sendmail.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-action',
  templateUrl: './order-action.component.html',
  styleUrls: ['./order-action.component.css']
})
export class OrderActionComponent implements OnInit {

  orderDetails!: OrderDetail[];
  order!: Order;
  listData!: MatTableDataSource<OrderDetail>;
  orderDetailLength!: number;

  columns: string[] = ['index', 'image', 'product', 'price', 'quantity', 'price'];

  @Input() orderId!: number;
  @Output()
  updateFinish: EventEmitter<any> = new EventEmitter<any>();

  constructor(private orderService: OrderService, private modalService: NgbModal, private toastr: ToastrService, private sendMailService:SendmailService) { }

  ngOnInit(): void {
    this.getOrder();
    this.getDetail();
  }

  getOrder() {
    this.orderService.getOrder(this.orderId).subscribe(data => {
      this.order = data as Order;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  getDetail() {
    this.orderService.getByOrder(this.orderId).subscribe(data => {
      this.orderDetails = data as OrderDetail[];
      this.listData = new MatTableDataSource(this.orderDetails);
      this.orderDetailLength = this.orderDetails.length;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  confirm() {
    Swal.fire({
      title: 'Bạn muốn xác nhận đơn hàng này ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.confirmOrder(this.order.id).subscribe(data => {
          this.toastr.success('Xác nhận thành công!', 'Hệ thống');
          this.updateFinish.emit('done');
          this.modalService.dismissAll();
          this.sendMailService.sendMailOrder(this.order).subscribe();
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

  cancel() {
    Swal.fire({
      title: 'Bạn muốn huỷ đơn hàng này ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Huỷ',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.approveCancelOrder(this.order.id).subscribe(data => {
          this.toastr.success('Huỷ thành công!', 'Hệ thống');
          this.updateFinish.emit('done');
          this.modalService.dismissAll();
          this.sendMailService.sendMailOrder(this.order).subscribe();
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

  paid() {
    Swal.fire({
      title: 'Bạn muốn xác nhận đơn hàng này đã giao thành công?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.deliveredOrder(this.order.id).subscribe(data => {
          this.toastr.success('Đã giao thành công!', 'Hệ thống');
          this.updateFinish.emit('done');
          this.modalService.dismissAll();
          this.sendMailService.sendMailOrder(this.order).subscribe();
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

  // Xử lý yêu cầu hủy đơn hàng từ user
  handleCancelRequest() {
    Swal.fire({
      title: 'Bạn muốn duyệt yêu cầu hủy đơn hàng này ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Duyệt',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.approveCancelOrder(this.order.id).subscribe(data => {
          this.toastr.success('Đã duyệt hủy đơn hàng!', 'Hệ thống');
          this.updateFinish.emit('done');
          this.modalService.dismissAll();
          this.sendMailService.sendMailOrder(this.order).subscribe(data=>{

          });
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

  denyCancel() {
    if (confirm('Bạn chắc chắn muốn từ chối yêu cầu hủy đơn này?')) {
      this.orderService.denyCancelOrder(this.order.id).subscribe(() => {
        this.toastr.success('Đã từ chối yêu cầu hủy đơn hàng!');
        this.updateFinish.emit();
      }, error => {
        this.toastr.error('Lỗi khi từ chối hủy đơn!');
      });
    }
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

}
