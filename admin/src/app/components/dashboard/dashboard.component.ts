import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Order } from 'src/app/common/Order';
import { User } from 'src/app/common/User';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { Chart, registerables } from 'chart.js';
import { StatisticalService } from 'src/app/services/statistical.service';
import { Statistical } from 'src/app/common/Statistical';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  orders!: Order[];
  users!: User[];
  userLength!: number;
  orderLength!: number;
  productLength!: number;
  statistical!: Statistical[];

  labels: string[] = [];
  data: number[] = [];
  year: number = 2021;
  years!: number[];
  myChartBar !: Chart;
  myChartDoughnut !: Chart;

  image!: string;

  user!: User;

  currentDate = new Date();
  revenue2025 = 0;
  recentOrders: Order[] = [];

  orderStatusCounts = [0, 0, 0, 0]; // [pending, processing, completed, cancelled]

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private productService: ProductService,
    private statisticalService: StatisticalService,
    private sessionService: SessionStorageService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    Chart.register(...registerables); // Đăng ký tất cả scales, controllers, plugins, elements
    this.checkLogin();
    this.loadDashboardData();
  }

  checkLogin() {
    this.user = this.sessionService.getSession() as User;
    if (this.user == null) {
      window.location.href = '/login';
    } else {
      this.image = this.user.image;
    }
  }

  logout() {
    this.sessionService.deleteSession();
    window.location.href = '/login';
  }

  getStatisticalYear() {
    this.statisticalService.getStatisticalYear(this.year).subscribe(data => {
      this.statistical = data as Statistical[];
      this.statistical.forEach(item => {
        this.labels.push('Tháng ' + item.month);
        this.data.push(item.amount);
      })
      this.loadChartBar();
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  getYears() {
    this.statisticalService.getYears().subscribe(data => {
      this.years = data as number[];
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  selectYear() {
    this.labels = [];
    this.data = [];
    this.myChartBar.destroy();
    this.ngOnInit();
  }

  loadChartBar() {
    this.myChartBar = new Chart('chart', {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          // label: '# of Votes',
          data: this.data,
          // borderColor: 'rgb(75, 192, 192)',
          // pointBorderColor: 'rgba(54, 162, 235, 0.2)',
          // backgroundColor: 'rgba(255, 99, 132, 0.2)',
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(201, 203, 207, 0.2)',
            'rgba(0, 162, 71, 0.2)',
            'rgba(82, 0, 36, 0.2)',
            'rgba(82, 164, 36, 0.2)',
            'rgba(255, 158, 146, 0.2)',
            'rgba(123, 39, 56, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)',
            'rgba(0, 162, 71, 1)',
            'rgba(82, 0, 36, 1)',
            'rgba(82, 164, 36, 1)',
            'rgba(255, 158, 146, 1)',
            'rgba(123, 39, 56, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  loadDashboardData() {
    // Load total users
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data as User[];
        this.userLength = this.users.length;
      },
      error: (error) => {
        this.toastr.error('Lỗi khi tải dữ liệu người dùng! ' + error.status, 'Hệ thống');
      }
    });

    // Load total products
    this.productService.getAll().subscribe({
      next: (data) => {
        this.productLength = (data as any[]).length;
      },
      error: (error) => {
        this.toastr.error('Lỗi khi tải dữ liệu sản phẩm! ' + error.status, 'Hệ thống');
      }
    });

    // Chỉ dùng getAllOrder()
    this.orderService.getAllOrder().subscribe({
      next: (data: any) => {
        const orders = data as Order[];
        this.orders = orders; // nếu cần dùng ở dashboard
        this.orderStatusCounts = [0, 0, 0, 0];
        orders.forEach(order => {
          const status = Number(order.status);
          if (status === 1) this.orderStatusCounts[0]++; // Chờ xác nhận
          else if (status === 2) this.orderStatusCounts[1]++; // Đang giao hàng
          else if (status === 3) this.orderStatusCounts[2]++; // Đã giao (Hoàn thành)
          else if (status === 0) this.orderStatusCounts[3]++; // Đã huỷ
        });

        // Đồng nhất số lượng đơn hàng chờ xử lý với trang quản lý đơn hàng
        this.orderLength = this.orderStatusCounts[0];

        this.recentOrders = orders
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 5);

        this.loadOrderStatusChart();
        console.log('Tổng số đơn hàng:', orders.length);
        console.log('Danh sách trạng thái:', orders.map(o => o.status));
      },
      error: (error: any) => {
        this.toastr.error('Lỗi khi tải đơn hàng gần đây! ' + error.status, 'Hệ thống');
      }
    });

    // Load 2025 revenue data
    this.statisticalService.getStatisticalYear(2025).subscribe({
      next: (data) => {
        this.statistical = data as Statistical[];
        // Calculate total revenue for 2025
        this.revenue2025 = this.statistical.reduce((total, item) => total + item.amount, 0);
        this.initializeChart();
      },
      error: (error) => {
        this.toastr.error('Lỗi khi tải dữ liệu doanh thu! ' + error.status, 'Hệ thống');
      }
    });
  }

  initializeChart() {
    setTimeout(() => {
      const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.statistical.map(item => 'Tháng ' + item.month),
            datasets: [{
              label: 'Doanh thu 2025',
              data: this.statistical.map(item => item.amount),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return (value as number / 1000000) + 'M';
                  }
                }
              }
            }
          }
        });
      }
    }, 0);
  }

  finish() {
    this.ngOnInit();
  }

  getStatusClass(status: number): string {
    switch(status) {
      case 0: return 'pending';
      case 1: return 'processing';
      case 2: return 'completed';
      case 3: return 'cancelled';
      default: return '';
    }
  }

  getStatusText(status: number): string {
    switch(status) {
      case 0: return 'Chờ xử lý';
      case 1: return 'Đang xử lý';
      case 2: return 'Hoàn thành';
      case 3: return 'Đã hủy';
      default: return 'Không xác định';
    }
  }

  loadOrderStatusChart() {
    setTimeout(() => {
      const ctx = document.getElementById('orderStatusChart') as HTMLCanvasElement;
      if (ctx) {
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Chờ xử lý', 'Đang xử lý', 'Hoàn thành', 'Đã hủy'],
            datasets: [{
              data: this.orderStatusCounts,
              backgroundColor: [
                '#FFD600', // pending
                '#42A5F5', // processing
                '#66BB6A', // completed
                '#EF5350'  // cancelled
              ],
              borderColor: '#fff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  color: '#333',
                  font: { size: 14, weight: 'bold' }
                }
              },
              title: {
                display: false
              }
            }
          }
        });
      }
    }, 0);
  }
}
