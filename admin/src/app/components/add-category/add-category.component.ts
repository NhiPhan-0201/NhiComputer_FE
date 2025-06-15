import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {

  postForm: FormGroup;

  @Output()
  saveFinish: EventEmitter<any> = new EventEmitter<any>();

  constructor(private modalService: NgbModal, private categoryService: CategoryService, private toastr: ToastrService) {
    this.postForm = new FormGroup({
      'categoryId': new FormControl(0),
      'categoryName': new FormControl(null, [Validators.required, Validators.minLength(2)]),
      'status': new FormControl(true)
    })
  }

  ngOnInit(): void {
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true });
  }

  save() {
    if (this.postForm.valid) {
      this.categoryService.post(this.postForm.value).subscribe(
        data => {
          this.modalService.dismissAll();
          this.toastr.success('Thêm thành công!', 'Hệ thống');
          // Khi thêm thành công
          this.saveFinish.emit('done');
          // Reset form chỉ khi thêm thành công
          this.postForm.reset({
            'categoryId': 0,
            'categoryName': null,
            'status': true
          });
        },
        error => {
          // Kiểm tra lỗi trả về từ backend
          const errMsg = error?.error?.message?.toLowerCase() || '';
          if (errMsg.includes('tồn tại') || errMsg.includes('exists') || errMsg.includes('trùng')) {
            this.toastr.error('Tên nhãn hàng đã tồn tại!', 'Hệ thống');
          } else {
            this.toastr.error('Lỗi! Thêm thất bại: ' + (error?.error?.message || error), 'Hệ thống');
          }
          // Không reset form khi lỗi
        }
      );
    } else {
      this.toastr.error('Lỗi! Thêm thất bại', 'Hệ thống');
    }
  }

}
