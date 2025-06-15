import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subcategory } from 'src/app/common/Subcategory';
import { SubcategoryService } from 'src/app/services/subcategory.service';
import Swal from 'sweetalert2';
import { User } from 'src/app/common/User';
import { SessionStorageService } from 'src/app/services/session-storage.service';

@Component({
  selector: 'app-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.css']
})
export class SubcategoriesComponent implements OnInit {
  listData!: MatTableDataSource<Subcategory>;
  subcategories!: Subcategory[];
  subcategoriesLength!: number;
  columns: string[] = ['subcategoryId', 'name', 'description', 'view', 'delete'];
  isLoading = true;
  user!:User;
  image!:string;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private subcategoryService: SubcategoryService,
    private sessionService: SessionStorageService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAll();
  }
    checkLogin() {
    this.user = this.sessionService.getSession() as User;
    if(this.user==null) {
      window.location.href = ('/login');
    }else {
      this.image = this.user.image;
    }
  }

  logout() {
    this.sessionService.deleteSession();
    window.location.href = '/login';
  }

  getAll() {
    this.subcategoryService.getAll().subscribe(data => {
      this.isLoading = false;
      this.subcategories = data;
      this.listData = new MatTableDataSource(this.subcategories);
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
      this.subcategoriesLength = data.length;
    }, error => {
      this.toastr.error('Lỗi tải dữ liệu loại sản phẩm!', 'Hệ thống');
    });
  }

  search(event: any) {
    const fValue = (event.target as HTMLInputElement).value;
    this.listData.filter = fValue.trim().toLowerCase();
  }

  delete(id: number, name: string) {
    Swal.fire({
      title: 'Bạn muốn xoá ' + name + ' ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subcategoryService.delete(id).subscribe(() => {
          this.ngOnInit();
          this.toastr.success('Xoá thành công!', 'Hệ thống');
        }, error => {
          this.toastr.error('Xoá thất bại!', 'Hệ thống');
        })
      }
    })
  }

  finish() {
    this.ngOnInit();
  }
}
