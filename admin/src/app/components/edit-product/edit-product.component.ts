import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Category } from 'src/app/common/Category';
import { Subcategory } from 'src/app/common/Subcategory'; // Import Subcategory model
import { Product } from 'src/app/common/Product';
import { CategoryService } from 'src/app/services/category.service';
import { SubcategoryService } from 'src/app/services/subcategory.service'; // Import SubcategoryService
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {

  @Input() id!: number; // Product ID to edit
  @Output() editFinish: EventEmitter<any> = new EventEmitter<any>();

  product!: Product;
  categories!: Category[];
  subcategories!: Subcategory[]; // Add subcategories property
  postForm: FormGroup;
  url: string = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...";

  constructor(
    private modalService: NgbModal,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService, // Inject SubcategoryService
    private productService: ProductService,
    private toastr: ToastrService
  ) {
    this.postForm = new FormGroup({
      'productId': new FormControl(0),
      'name': new FormControl(null, [Validators.minLength(6), Validators.required]),
      'quantity': new FormControl(null, [Validators.min(1), Validators.required]),
      'price': new FormControl(null, [Validators.required, Validators.min(100000)]),
      'discount': new FormControl(null, [Validators.required, Validators.min(0), Validators.max(100)]),
      'image': new FormControl(),
      'description': new FormControl(null, Validators.required),
      'enteredDate': new FormControl(new Date()),
      'categoryId': new FormControl(1, Validators.required),
      'subcategoryId': new FormControl(null, Validators.required) // Add subcategoryId
    });
  }

  ngOnInit(): void {
    this.getCategories();
    this.getSubcategories(); // Fetch subcategories
    this.loadProductData(); // Load product data for editing
  }

  getCategories() {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data as Category[];
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu danh mục, bấm F5!', 'Hệ thống');
    });
  }

  getSubcategories() {
    this.subcategoryService.getAll().subscribe(data => {
      this.subcategories = data as Subcategory[];
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu danh mục con, bấm F5!', 'Hệ thống');
    });
  }

  loadProductData() {
    this.productService.getOne(this.id).subscribe(data => {
      this.product = data as Product;
      this.postForm.patchValue({
        productId: this.product.productId,
        name: this.product.name,
        quantity: this.product.quantity,
        price: this.product.price,
        discount: this.product.discount,
        image: this.product.image,
        description: this.product.description,
        enteredDate: this.product.enteredDate,
        categoryId: this.product.category.categoryId,
        subcategoryId: this.product.subcategory?.subcategoryId // Handle subcategory
      });
      this.url = this.product.image;
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu sản phẩm, bấm F5!', 'Hệ thống');
    });
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true, size: "lg" });
  }

  update() {
    if (this.postForm.valid) {
      this.product = this.postForm.value;
      this.product.status = true;
      this.product.category = new Category(this.postForm.value.categoryId, '');
      this.product.subcategory = new Subcategory(this.postForm.value.subcategoryId, ''); // Map subcategory
      this.product.image = this.url;
      this.productService.put(this.id, this.product).subscribe(data => {
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

  readUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.url = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }
}
