import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router'; // Đảm bảo đã import ParamMap
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
import { FavoriteService } from 'src/app/services/favorite.service';
import { Favorite } from 'src/app/common/Favorite';
import { ProductImage } from 'src/app/common/ProductImage';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css']
})
export class ItemDetailComponent implements OnInit {

  product!: Product;
  productsSuggest!: Product[];
  products!: Product[];
  id!: number;
  cId!: number;

  rateProduct!: Rate[];
  rates!: Rate[];
  ratesI!: Rate[];
  rateSize: number = 5;
  rateLength!: number;
  rateAvg: number = 0;

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  totalCartItem!: number;

  isLoading = true;
  isFavorite: boolean = false;

  user!: Customer;

  currentImage: string = '';
  productImages: ProductImage[] = [];

  quantity: number = 1;

  constructor(private route: ActivatedRoute, private productService: ProductService, private toastr: ToastrService, private favoriteService: FavoriteService,
    private router: Router, private cartService: CartService, private rateService: RateService, private localStorageService: LocalStorageService) {
  }
  addToWishlist(productId: number): void {
  this.user = this.localStorageService.getUser();
  if (!this.user) {
    this.router.navigate(['/login']);
    return;
  }

  if (!this.isFavorite) {
    this.favoriteService.addFavorite(this.user.userId, productId).subscribe(
      () => {
        this.isFavorite = true;
        this.toastr.success('Đã thêm vào danh sách yêu thích!', 'Hệ thống');
      },
      () => {
        this.toastr.error('Lỗi khi thêm vào yêu thích!', 'Hệ thống');
      }
    );
  } else {
    this.favoriteService.removeFavorite(this.user.userId, productId).subscribe(
      () => {
        this.isFavorite = false;
        this.toastr.info('Đã xóa khỏi danh sách yêu thích!', 'Hệ thống');
      },
      () => {
        this.toastr.error('Lỗi khi xóa khỏi yêu thích!', 'Hệ thống');
      }
    );
  }
}
  ngOnInit(): void {
    // Lắng nghe thay đổi param id
    this.route.paramMap.subscribe((params: ParamMap) => {
      const productId = Number(params.get('id'));
      this.id = productId;

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Fetch product images
      this.getProductImages(productId);

      // Check if the product is in the favorite list
      const user = this.localStorageService.getUser();
      if (user) {
        this.user = user;
        this.favoriteService.isFavorite(user.userId, productId).subscribe(
          (isFav) => {
            this.isFavorite = isFav;
          },
          () => {
            this.toastr.error('Error checking favorite!', 'System');
          }
        );
      }

      // Fetch product details and ratings
      this.getProduct();
      this.getRateOfItem();
      this.getAllRate();
    });

    // Subscribe to cart changes (chỉ cần gọi 1 lần)
    this.cartService.$data.subscribe((data) => {
      this.totalCartItem = data;
    });
  }

  getProductImages(productId: number) {
    this.productService.getProductImages(productId).subscribe(
      (images) => {
        this.productImages = images as ProductImage[];
        if (this.productImages.length > 0) {
          this.currentImage = this.productImages[0].imageUrl;
        }
      },
      () => {
        this.toastr.error('Cannot fetch product images!', 'Error');
      }
    );
  }

  toggleFavorite() {
    const userId = this.localStorageService.getUser()?.userId;
    const productId = this.product?.productId;

    if (!userId || !productId) {
      this.toastr.error('Please login or select a product!', 'System');
      return;
    }

    if (this.isFavorite) {
      this.favoriteService.removeFavorite(userId, productId).subscribe(
        () => {
          this.isFavorite = false;
          this.toastr.info('Đã xóa khỏi yêu thích !', 'System');
        },
        () => {
          this.toastr.error('Lỗi khi xóa khỏi yêu thích !', 'System');
        }
      );
    } else {
      this.favoriteService.addFavorite(userId, productId).subscribe(
        () => {
          this.isFavorite = true;
          this.toastr.success('Thêm vào yêu thích!', 'System');
        },
        () => {
          this.toastr.error('Lỗi khi thêm vào yêu thích!', 'System');
        }
      );
    }
  }

  getProduct() {
    this.productService.getOne(this.id).subscribe(
      (data) => {
        this.product = data as Product;
        this.cId = this.product.category.categoryId;
        this.productService.getByCategory(this.cId).subscribe(
          (data) => {
            this.isLoading = false;
            this.productsSuggest = data as Product[];
            this.productService.getAll().subscribe(
              (data) => {
                this.products = data as Product[];
                this.productsSuggest = this.productsSuggest.concat(this.products);
              },
              () => {
                this.toastr.error('Error fetching data!', 'System');
              }
            );
          },
          () => {
            this.toastr.error('Error fetching data!', 'System');
          }
        );
      },
      () => {
        this.toastr.error('This product may be out of stock!', 'System');
        this.router.navigate(['/home-page']);
      }
    );
  }

  getAllRate() {
    this.rateService.getAll().subscribe(
      (data) => {
        this.rates = data as Rate[];
      },
      (error) => {
        this.toastr.error('Error fetching data! ' + error.status, 'System');
      }
    );
  }

  getStar(id: number): number {
    this.rateProduct = this.rates.filter((item) => item.product.productId === id);
    const totalStars = this.rateProduct.reduce((sum, item) => sum + item.star, 0);
    return this.rateProduct.length > 0 ? totalStars / this.rateProduct.length : 0;
  }

  getRateOfItem() {
    this.rateService.getByProduct(this.id).subscribe(
      (data) => {
        this.ratesI = data as Rate[];
        const totalStars = this.ratesI.reduce((sum, item) => sum + item.star, 0);
        this.rateAvg = this.ratesI.length > 0 ? totalStars / this.ratesI.length : 0;
        this.rateLength = this.ratesI.length;
      },
      (error) => {
        this.toastr.error('Error! ' + error.status, 'System');
      }
    );
  }

  onQuantityChange() {
    if (this.quantity > 5) {
      this.quantity = 5;
      this.toastr.warning('Nếu muốn mua hơn 5 sản phẩm, vui lòng liên hệ hotline: 0344134596 để được tư vấn!', 'Thông báo');
    }
    if (this.quantity < 1) {
      this.quantity = 1;
    }
  }

  addCart(productId: number, price: number) {
    const user = this.localStorageService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.product || this.product.quantity <= 0) {
      this.toastr.warning('Sản phẩm đã hết hàng!', 'Thông báo');
      return;
    }
    if (this.quantity > 5) {
      this.toastr.warning('Nếu muốn mua hơn 5 sản phẩm, vui lòng liên hệ hotline: 0344134596 để được tư vấn!', 'Thông báo');
      return;
    }
    this.cartService.getCart(user.userId).subscribe(
      (cart) => {
        this.cart = cart as Cart;
        this.cartDetail = new CartDetail(0, this.quantity, price, new Product(productId), new Cart(this.cart.id));
        this.cartService.postDetail(this.cartDetail).subscribe(
          () => {
            this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
            // Lấy lại chi tiết giỏ hàng để tính tổng số lượng
            this.cartService.getAllDetail(this.cart.id).subscribe((cartDetails) => {
              this.cartDetails = cartDetails as CartDetail[];
              // Tính tổng số lượng sản phẩm trong giỏ
              const totalQuantity = this.cartDetails.reduce((sum, item) => sum + item.quantity, 0);
              // Cập nhật lên icon giỏ hàng
              this.cartService.setData(totalQuantity);
            });
          },
          () => {
            this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
          }
        );
      },
      () => {
        this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
      }
    );
  }
    changeMainImage(imageUrl: string) {
    this.currentImage = imageUrl;
  }

  onImageError(event: Event, isThumb: boolean = false) {
    const target = event.target as HTMLImageElement;
    target.src = isThumb
      ? 'assets/no-image-thumb.png'
      : 'assets/no-image.png';
  }
}
