import { Component, EventEmitter, OnInit, Output, TemplateRef, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subcategory } from 'src/app/common/Subcategory';
import { SubcategoryService } from 'src/app/services/subcategory.service';

@Component({
  selector: 'app-add-subcategory',
  templateUrl: './add-subcategory.component.html',
  styleUrls: ['./add-subcategory.component.css']
})
export class AddSubcategoryComponent implements OnInit {

  @Input() editId?: number; // Nếu truyền vào thì là edit mode
  @Output() saveFinish: EventEmitter<any> = new EventEmitter<any>();

  postForm: FormGroup;
  subcategory?: Subcategory;

  constructor(
    private modalService: NgbModal,
    private subcategoryService: SubcategoryService,
    private toastr: ToastrService
  ) {
    this.postForm = new FormGroup({
      'subcategoryId': new FormControl(0),
      'name': new FormControl(null, [Validators.required, Validators.minLength(3)]),
    });
  }

  ngOnInit(): void {
    if (this.editId) {
      this.loadData(this.editId);
    }
  }

  open(content: TemplateRef<any>) {
    if (this.editId) {
      this.loadData(this.editId, () => {
        this.modalService.open(content, { centered: true, size: 'md' });
      });
    } else {
      this.resetForm();
      this.modalService.open(content, { centered: true, size: 'md' });
    }
  }

  loadData(id: number, cb?: () => void) {
    this.subcategoryService.get(id).subscribe(data => {
      this.subcategory = data;
      this.postForm.patchValue({
        subcategoryId: data.subcategoryId,
        name: data.name,
      });
      if (cb) cb();
    }, error => {
      this.toastr.error('Không tìm thấy loại sản phẩm!', 'Hệ thống');
    });
  }

  save() {
    if (this.postForm.valid) {
      const sub: Subcategory = this.postForm.value;
      if (!sub.subcategoryId || sub.subcategoryId === 0) {
        // Thêm mới
        this.subcategoryService.add(sub).subscribe(_ => {
          this.modalService.dismissAll();
          this.toastr.success('Thêm loại sản phẩm thành công!', 'Hệ thống');
          this.saveFinish.emit('done');
          this.resetForm();
        }, error => {
          this.toastr.error('Thêm thất bại!', 'Hệ thống');
        });
      } else {
        // Sửa
        this.subcategoryService.update(sub).subscribe(_ => {
          this.modalService.dismissAll();
          this.toastr.success('Cập nhật thành công!', 'Hệ thống');
          this.saveFinish.emit('done');
        }, error => {
          this.toastr.error('Cập nhật thất bại!', 'Hệ thống');
        });
      }
    } else {
      this.toastr.error('Vui lòng nhập đủ và đúng thông tin!', 'Hệ thống');
    }
  }

  resetForm() {
    this.postForm.reset({
      subcategoryId: 0,
      name: null,
      description: null
    });
  }
}
