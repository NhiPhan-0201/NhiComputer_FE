import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Product } from 'src/app/common/Product';
import { Rate } from 'src/app/common/Rate';
import { ChatMessage, ChatResponse } from 'src/app/common/Chat';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProductService } from 'src/app/services/product.service';
import { RateService } from 'src/app/services/rate.service';
import { ChatService } from 'src/app/services/chat.service';
import { SubcategoryService } from 'src/app/services/subcategory.service';
import { Subcategory } from 'src/app/common/Subcategory';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  key: string = '';
  keyF: string = '';
  reverse: boolean = true;
  totalLength!: number;
  page: number = 1;
  rates!: Rate[];
  rateProduct!: Rate[];
  subcategories: any[] = [];
  productsBySubcategory: { [key: number]: any[] } = {};
  isLoading: boolean = false;
  customerId!: number;
  user!: Customer;
  products: any[] = [];

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  totalCartItem!: number;

  currentSlide = 0;
  slides: HTMLImageElement[] = [];
  dots: HTMLElement[] = [];
  autoSlideInterval: any;
  priceRange: string = '';

  isChatOpen = false;
  messages: ChatMessage[] = [];
  newMessage: string = '';

  @ViewChild('messageContainer') private messageContainer!: ElementRef;


  bestSellers: Product[] = [];
  isLoadingBestSellers: boolean = true;

  newsList = [
      {
        id: 1,
        title: 'Công nghệ mới nhất trong laptop 2024',
        date: '15/03/2024',
        image: 'assets/new1.jpg',
        excerpt: 'Khám phá những công nghệ đột phá trong thế hệ laptop mới nhất...',
        url: 'https://www.24h.com.vn/thoi-trang-hi-tech/xu-huong-laptop-2024-2025-hieu-nang-cao-trong-thiet-ke-mong-nhe-c407a1619704.html'
      },
      {
        id: 2,
        title: 'Hướng dẫn chọn laptop phù hợp',
        date: '10/03/2024',
        image: 'assets/news2.png',
        excerpt: 'Bí quyết chọn laptop phù hợp với nhu cầu sử dụng của bạn...',
        url: 'https://zin100.vn/chon-laptop-phu-hop-nhu-cau-cong-viec/'
      },
      {
        id: 3,
        title: 'Top laptop gaming hot',
        date: '05/03/2024',
        image: 'assets/game.png',
        excerpt: 'Những xu hướng mới nhất trong thế giới laptop gaming...',
        url: 'https://laptopaz.vn/top-04-laptop-gaming-moi-nhat-2024-khong-the-bo-lo.html'
      },
      {
        id: 4,
        title: 'Bảo mật laptop: Những điều cần biết',
        date: '01/03/2024',
        image: 'assets/news4.png',
        excerpt: 'Cách bảo vệ dữ liệu và tăng cường bảo mật cho laptop...',
        url: 'https://cohotech.vn/blog/46007/#:~:text=Top%205%20m%E1%BA%B9o%20b%E1%BA%A3o%20m%E1%BA%ADt%20th%C3%B4ng%20tin%20c%C3%A1,%C4%91%E1%BB%83%20tr%C3%A1nh%20m%E1%BA%A5t%20th%C3%B4ng%20tin%20quan%20tr%E1%BB%8Dng%20'
      }
    ];


  promos = [
    { id: 1, title: 'Giảm giá 50%', description: 'Giảm giá 50% cho tất cả laptop gaming', image: 'assets/anh50.png', endDate: '31/06/2024' },
    { id: 2, title: 'Quà tặng hấp dẫn', description: 'Tặng balo và chuột gaming khi mua laptop', image: 'assets/gift.png', endDate: '30/03/2024' },
    { id: 3, title: 'Trả góp 0%', description: 'Trả góp 0% lãi suất trong 12 tháng', image: 'assets/gop.png', endDate: '25/03/2024' }
  ];
  bannerImages = [
  'assets/banner1.png',
  'assets/banner2.jpg',
  'assets/banner5.jpg',
  'assets/banner3.png',
  'assets/poster2.jpg'
];
showBackToTop = false;
showPlaceholder = false;

 isAdminChatOpen = false;
 adminSessions = [];
 adminMessages = [];
 selectedSessionId: number | null = null;
 newAdminMessage = '';
 currentUserId = 123; // Lấy từ auth service

 constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService,
    private cartService: CartService,
    private rateService: RateService,
    private localStorageService: LocalStorageService,
    private chatService: ChatService,
    private subcategoryService: SubcategoryService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
     window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cartService.$data.subscribe(data => {
      this.totalCartItem = data;
    });

    this.getAllRate();
    this.loadSubcategories();
    this.getUser();
    this.getBestSellingProducts();
    this.initSlider();
    this.addBotMessage('Xin chào! Tôi có thể giúp gì cho bạn?');

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
    // Tìm sản phẩm trong bestSellers hoặc productsBySubcategory
    let product = this.bestSellers.find(p => p.productId === productId);
    if (!product) {
      for (const key in this.productsBySubcategory) {
        product = this.productsBySubcategory[key]?.find((p: any) => p.productId === productId);
        if (product) break;
      }
    }
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

  initSlider() {
    this.slides = Array.from(document.querySelectorAll('.banner-img'));
    this.dots = Array.from(document.querySelectorAll('.dot'));
    this.startAutoSlide();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    clearInterval(this.autoSlideInterval);
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.updateSlider();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlider();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlider();
  }

  updateSlider() {
    this.slides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    this.dots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  quickReplies = [
  { label: 'Tôi có thể liên hệ qua ai tư vấn', keyword: 'Tôi có thể liên hệ qua ai tư vấn' },
  { label: 'Chính sách bảo hành', keyword: 'Chính sách bảo hành' },
  { label: 'Đổi trả', keyword: 'Đổi trả' },
  { label: 'Khuyến mãi', keyword: 'Khuyến mãi' },
  { label: 'Thời gian giao hàng bao lâu?', keyword: 'Thời gian giao hàng bao lâu?' },
];

  quickReply(q: any) {
    this.newMessage = q.label;
    this.sendMessage(true); // true: là quick reply
  }

  sendMessage(isQuickReply = false) {
    const userMsg = this.newMessage.trim();
    if (!userMsg) return;
    this.messages.push({ type: 'user', content: userMsg, timestamp: new Date() });
    this.newMessage = '';
    this.isLoading = true;

    let botReply = '';
    switch (userMsg) {
      case 'Tôi có thể liên hệ qua ai tư vấn':
        botReply = 'Bạn có thể liên hệ trực tiếp với chuyên viên tư vấn Yến Nhi qua số Zalo: 0344134596 để được hỗ trợ nhanh nhất nhé!';
        break;
      case 'Chính sách bảo hành':
        botReply = 'Sản phẩm được bảo hành 12 tháng tại cửa hàng. Vui lòng giữ hóa đơn để được hỗ trợ.';
        break;
      case 'Đổi trả':
        botReply = 'Bạn có thể đổi trả sản phẩm trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.';
        break;
      case 'Khuyến mãi':
        botReply = 'Các chương trình khuyến mãi sẽ được cập nhật thường xuyên trên website.';
        break;
      default:
        // Nếu không phải quick reply thì xử lý như cũ (gọi API hoặc logic cũ)
        this.chatService.sendMessage(userMsg).subscribe({
          next: (response: ChatResponse) => {
            this.addBotMessage(response.response || 'Xin lỗi, không nhận được phản hồi hợp lệ.');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error sending message:', error);
            this.addBotMessage(`Lỗi: ${error.status || 'Unknown'} - ${error.message || 'No message'}`);
            this.isLoading = false;
          }
        });
        return;
    }
    setTimeout(() => {
      this.messages.push({ type: 'bot', content: botReply, timestamp: new Date() });
      this.isLoading = false;
    }, 600);
  }

  private addBotMessage(content: string) {
    const message = new ChatMessage('bot', content);
    this.messages.push(message);
    this.scrollToBottom();
  }

  private addUserMessage(content: string) {
    const message = new ChatMessage('user', content);
    this.messages.push(message);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  getBestSellingProducts() {
    this.isLoadingBestSellers = true;
    this.productService.getBestSelling(4).subscribe(
      (data: any) => {
        console.log('Best sellers:', data);
        this.bestSellers = data;
        this.isLoadingBestSellers = false;
      },
      error => {
        this.toastr.error('Lỗi khi tải sản phẩm bán chạy!', 'Hệ thống');
        this.isLoadingBestSellers = false;
      }
    );
  }

  viewProduct(productId: number) {
    this.router.navigate(['/products', productId]);
  }
loadSubcategories() {
  this.http.get<any[]>('http://localhost:8989/api/subcategories').subscribe(subs => {
    this.subcategories = subs;
    subs.forEach(sub => {
      this.http.get<any[]>(`http://localhost:8989/api/subcategories/${sub.subcategoryId}/products`)
        .subscribe(products => {
          this.productsBySubcategory[sub.subcategoryId] = products;
        });
    });
  });
}
search(event: any) {
  const name = (event.target as HTMLInputElement).value;
  this.fetchFilteredProducts(name, this.keyF, this.priceRange);
}

sort(keyF: string) {
  this.keyF = keyF;
  this.fetchFilteredProducts(this.key, keyF, this.priceRange);
}

filterByPrice(range: string) {
  this.priceRange = range;
  this.fetchFilteredProducts(this.key, this.keyF, range);
}

resetFilter(): void {
  this.key = '';
  this.keyF = '';
  this.priceRange = '';
  this.page = 1;
  this.fetchFilteredProducts();
}

fetchFilteredProducts(name: string = '', sort: string = '', priceRange: string = '') {
    this.isLoading = true;
    this.productService.filterProducts(name, sort, priceRange).subscribe(
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
}
