import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Rate } from 'src/app/common/Rate';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProductService } from 'src/app/services/product.service';
import { RateService } from 'src/app/services/rate.service';
import { SubcategoryService } from 'src/app/services/subcategory.service';
import { Product } from '../../common/Product';
import { Subcategory } from 'src/app/common/Subcategory';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;

  rates: Rate[] = [];
  rateProduct: Rate[] = [];

  customerId!: number;
  user!: Customer;

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  totalCartItem!: number;

  totalLength: number = 0;
  page: number = 1;

  key: string = '';
  keyF: string = '';
  reverse: boolean = true;
  priceRange: string = '';

  showBackToTop = false;

  subcategories: Subcategory[] = [];
  selectedSubcategory: string = '';

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService,
    private cartService: CartService,
    private rateService: RateService,
    private localStorageService: LocalStorageService,
    private subcategoryService: SubcategoryService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cartService.$data.subscribe(data => {
      this.totalCartItem = data;
    });
    this.getAllRate();
    this.getUser();
    this.fetchFilteredProducts();
    this.getAllSubcategories();
    window.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll, true);
  }

  onScroll = () => {
    this.showBackToTop = window.scrollY > 400;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getUser() {
    this.user = this.localStorageService.getUser();
    if (this.user != null) {
      this.customerId = this.user.userId;
    }
  }

  resetFilter(): void {
    this.key = '';
    this.keyF = '';
    this.priceRange = '';
    this.page = 1;
    this.fetchFilteredProducts();
  }

  getAllSubcategories() {
    this.subcategoryService.getAll().subscribe(
      (data: any) => {
        this.subcategories = data;
      },
      error => {
        this.toastr.error('Không lấy được danh mục sản phẩm!', 'Hệ thống');
      }
    );
  }

  filterBySubcategory(subcategoryId: string) {
    this.selectedSubcategory = subcategoryId;
    this.fetchFilteredProducts(this.key, this.keyF, this.priceRange, subcategoryId);
  }

  fetchFilteredProducts(name: string = '', sort: string = '', priceRange: string = '', subcategoryId: string = '') {
    this.isLoading = true;
    this.productService.filterSubSubProducts(name, sort, priceRange, subcategoryId).subscribe(
      (data: any) => {
        this.products = data;
        this.totalLength = this.products.length;
        this.isLoading = false;
      },
      error => {
        this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
        this.isLoading = false;
      }
    );
  }

  getAllRate() {
    this.rateService.getAll().subscribe(
      data => {
        this.rates = data as Rate[];
      },
      error => {
        this.toastr.error('Lỗi truy xuất dữ liệu! ' + error.status, 'Hệ thống');
      }
    );
  }

  getStar(id: number): number {
    this.rateProduct = [];
    for (const item of this.rates) {
      if (item.product.productId === id) {
        this.rateProduct.push(item);
      }
    }
    let star: number = 0;
    for (const item of this.rateProduct) {
      star += item.star;
    }
    if (this.rateProduct.length == 0) {
      return 0;
    }
    return star / this.rateProduct.length;
  }

  addCart(productId: number, price: number) {
    this.user = this.localStorageService.getUser();
    const product = this.products.find(p => p.productId === productId);
    if (!product || product.quantity <= 0) {
      this.toastr.warning('Sản phẩm đã hết hàng!', 'Thông báo');
      return;
    }
    if (this.user != null) {
      this.customerId = this.user.userId;
      this.cartService.getCart(this.customerId).subscribe(
        data => {
          this.cart = data as Cart;
          this.cartDetail = new CartDetail(0, 1, price, new Product(productId), new Cart(this.cart.id));
          this.cartService.postDetail(this.cartDetail).subscribe(
            data => {
              this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
              this.cartService.getAllDetail(this.cart.id).subscribe((cartDetails) => {
                this.cartDetails = cartDetails as CartDetail[];
                // SAI: chỉ là số loại sản phẩm
                // this.cartService.setData(this.cartDetails.length);

                // ĐÚNG: tổng số lượng sản phẩm
                const totalQuantity = this.cartDetails.reduce((sum, item) => sum + item.quantity, 0);
                this.cartService.setData(totalQuantity);
              });
            },
            error => {
              this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
            }
          );
        },
        error => {
          this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  search(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.key = value;
    this.fetchFilteredProducts(this.key, this.keyF, this.priceRange);
  }

  sort(keyF: string) {
    this.keyF = keyF;
    this.fetchFilteredProducts(this.key, this.keyF, this.priceRange);
  }

  filterByPrice(range: string) {
    this.priceRange = range;
    this.fetchFilteredProducts(this.key, this.keyF, this.priceRange);
  }
}

