import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ProductImage } from 'src/app/common/ProductImage';
import { User } from 'src/app/common/User';
import { ProductImageService } from 'src/app/services/product-images.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-images',
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.css']
})
export class ProductImagesComponent implements OnInit {

  listData!: MatTableDataSource<ProductImage>;
  images!: ProductImage[];
  imagesLength!: number;
  columns: string[] = ['image', 'productId', 'uploadedDate', 'delete'];

  isLoading = true;

  user!: User;
  image!: string;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productImageService: ProductImageService,
    private toastr: ToastrService,
    private sessionService: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.getAllImages();
  }

  checkLogin() {
    this.user = this.sessionService.getSession() as User;
    if (this.user == null) {
      window.location.href = ('/login');
    } else {
      this.image = this.user.image;
    }
  }

  logout() {
    this.sessionService.deleteSession();
    window.location.href = '/login';
  }

  // ✅ Lấy tất cả hình ảnh từ database
  getAllImages() {
    if (!this.user) {
      this.toastr.error('Bạn cần đăng nhập để thực hiện thao tác này.', 'Lỗi');
      window.location.href = '/login';
      return;
    }

    this.productImageService.getAllImages().subscribe(data => {
      console.log('Dữ liệu tất cả hình ảnh:', data);
      this.isLoading = false;
      this.images = data;
      this.listData = new MatTableDataSource(this.images);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
    }, error => {
      this.isLoading = false;
      this.toastr.error('Không thể tải dữ liệu hình ảnh.', 'Lỗi');
    });
  }

  // Tìm kiếm hình ảnh theo từ khoá
  search(event: any) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.listData.filter = searchValue.trim().toLowerCase();
  }

  // Xóa hình ảnh
  delete(imageId: number) {
    Swal.fire({
      title: 'Bạn muốn xoá hình ảnh này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productImageService.delete(imageId).subscribe(() => {
          this.getAllImages(); // Cập nhật lại danh sách sau khi xóa
          this.toastr.success('Xóa thành công!', 'Hệ thống');
        }, error => {
          this.toastr.error('Xóa thất bại!', 'Hệ thống');
        });
      }
    });
  }

  finish() {
    this.getAllImages();
  }
}
