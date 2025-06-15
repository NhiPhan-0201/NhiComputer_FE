import { Component, Input, OnInit, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/common/Customer';
import { Product } from 'src/app/common/Product';
import { Rate } from 'src/app/common/Rate';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { RateService } from 'src/app/services/rate.service';

@Component({
  selector: 'app-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.css']
})
export class RateComponent implements OnInit {
  star: number = 5; // Giá trị mặc định là 5
  comment!: string;
  rate!: Rate;
  user!: Customer;

  @Input() product!: Product;
  @Output() rated = new EventEmitter<void>();

  constructor(
    private modalService: NgbModal,
    private rateService: RateService,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true });
  }

  updateRating(rating: number) {
    this.star = rating; // Cập nhật giá trị star khi người dùng chọn
  }

  rating() {
    this.user = this.localStorageService.getUser();
    this.rate = new Rate(0, this.star, this.comment, new Date(), this.product, new Customer(this.user.userId));
    this.rateService.post(this.rate).subscribe(data => {
      this.toastr.success('Đánh giá thành công!', 'Hệ thống');
      this.modalService.dismissAll();
      this.rated.emit(); // Báo cho component cha biết đã đánh giá xong
    });
  }
}
