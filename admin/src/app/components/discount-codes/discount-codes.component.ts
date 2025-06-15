import { Component, OnInit } from '@angular/core';
import { DiscountCodeService } from '../../services/discount-codes.service';

@Component({
  selector: 'app-discount-codes',
  templateUrl: './discount-codes.component.html',
  styleUrls: ['./discount-codes.component.css']
})
export class DiscountCodesComponent implements OnInit {
  codes: any[] = [];
  selected: any = null;
  isEdit = false;
  image = 'assets/default-avatar.png'; // hoặc lấy từ user profile

  constructor(private codeService: DiscountCodeService) {}

  ngOnInit() {
    this.loadCodes();
  }

  loadCodes() {
    this.codeService.getAll().subscribe(data => this.codes = data);
  }

  edit(code: any) {
    this.selected = { ...code };
    this.isEdit = true;
  }

  addNew() {
    this.selected = {
      code: '', description: '', discountType: 'percent', discountValue: 0,
      maxUses: 1, startDate: '', endDate: '', minOrderValue: 0, status: true
    };
    this.isEdit = true;
  }

  save() {
    if (this.selected.id) {
      this.codeService.update(this.selected.id, this.selected).subscribe(() => {
        this.isEdit = false;
        this.loadCodes();
      });
    } else {
      this.codeService.create(this.selected).subscribe(() => {
        this.isEdit = false;
        this.loadCodes();
      });
    }
  }

  delete(id: number) {
    if (confirm('Xóa mã này?')) {
      this.codeService.delete(id).subscribe(() => this.loadCodes());
    }
  }

  cancel() {
    this.isEdit = false;
    this.selected = null;
  }

  logout() {
    // Xử lý đăng xuất
  }

  finish() {
    this.ngOnInit();
  }
}
