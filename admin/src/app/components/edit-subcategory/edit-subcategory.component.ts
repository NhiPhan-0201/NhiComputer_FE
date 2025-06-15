import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subcategory } from 'src/app/common/Subcategory';
import { SubcategoryService } from 'src/app/services/subcategory.service';

@Component({
  selector: 'app-edit-subcategory',
  templateUrl: './edit-subcategory.component.html',
  styleUrls: ['./edit-subcategory.component.css']
})
export class EditSubcategoryComponent implements OnInit {

  @Input() id!: number; // Subcategory ID
  @Output() editFinish: EventEmitter<any> = new EventEmitter<any>();

  subcategory!: Subcategory;
  postForm: FormGroup;

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
    this.loadSubcategoryData();
  }

  loadSubcategoryData() {
    this.subcategoryService.get(this.id).subscribe(data => {
      this.subcategory = data;
      this.postForm.patchValue({
        subcategoryId: this.subcategory.subcategoryId,
        name: this.subcategory.name,
      });
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu loại sản phẩm, bấm F5!', 'Hệ thống');
    });
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true, size: "md" });
  }

  update() {
    if (this.postForm.valid) {
      const sub: Subcategory = this.postForm.value;
      this.subcategoryService.update(sub).subscribe(data => {
        this.modalService.dismissAll();
        this.toastr.success('Cập nhật thành công!', 'Hệ thống');
        this.editFinish.emit('done');
      }, error => {
        this.toastr.error('Cập nhật thất bại! ' + error, 'Hệ thống');
      });
    } else {
      this.toastr.error('Hãy kiểm tra và nhập lại dữ liệu!', 'Hệ thống');
    }
  }
}
