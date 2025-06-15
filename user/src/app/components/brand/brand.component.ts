import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Rate } from 'src/app/common/Rate';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProductService } from 'src/app/services/product.service';
import { RateService } from 'src/app/services/rate.service';
import { Product } from '../../common/Product';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css']
})
export class BrandComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  id!: number;
  brand!: string;

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

  rates: Rate[] = [];
  rateProduct: Rate[] = [];

  user!: Customer;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    private rateService: RateService,
    private router: ActivatedRoute,
    private route: Router,
    private cartService: CartService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.cartService.$data.subscribe(data => {
      this.totalCartItem = data;
    });

    this.router.params.subscribe(params => {
      this.id = +params['id'];
      this.fetchFilteredProducts();
      this.getAllRate();
    });
  }

  fetchFilteredProducts(name: string = '', sort: string = '', priceRange: string = '') {
    this.isLoading = true;
    this.productService.filterProducts(name, sort, priceRange, this.id).subscribe(
      (data: any) => {
        this.products = data;
        this.totalLength = this.products.length;
        this.isLoading = false;
        if (this.products.length > 0 && this.products[0].category) {
          this.brand = this.products[0].category.categoryName;
        }
      },
      error => {
        this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
        this.isLoading = false;
      }
    );
  }

  resetFilter(): void {
    this.key = '';
    this.keyF = '';
    this.priceRange = '';
    this.page = 1;
    this.fetchFilteredProducts();
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

  addCart(productId: number, price: number) {
    this.user = this.localStorageService.getUser();
    if (this.user != null) {
      this.cartService.getCart(this.user.userId).subscribe(data => {
        this.cart = data as Cart;
        this.cartDetail = new CartDetail(0, 1, price, new Product(productId), new Cart(this.cart.id));
        this.cartService.postDetail(this.cartDetail).subscribe(data => {
          this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
          this.cartService.getAllDetail(this.cart.id).subscribe((cartDetails) => {
            this.cartDetails = cartDetails as CartDetail[];
            // SAI: chỉ là số loại sản phẩm
            // this.cartService.setData(this.cartDetails.length);

            // ĐÚNG: tổng số lượng sản phẩm
            const totalQuantity = this.cartDetails.reduce((sum, item) => sum + item.quantity, 0);
            this.cartService.setData(totalQuantity);
          });
        }, error => {
          this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
          this.route.navigate(['/home-page']);
        });
      }, error => {
        this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
        this.route.navigate(['/home-page']);
      });
    } else {
      this.route.navigate(['/login']);
    }
  }

  getAllRate() {
    this.rateService.getAll().subscribe(data => {
      this.rates = data as Rate[];
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu! ' + error.status, 'Hệ thống');
    });
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
}
