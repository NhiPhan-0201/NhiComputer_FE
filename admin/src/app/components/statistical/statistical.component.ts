import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Chart, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { Statistical } from 'src/app/common/Statistical';
import { User } from 'src/app/common/User';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { StatisticalService } from 'src/app/services/statistical.service';

// import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-statistical',
  templateUrl: './statistical.component.html',
  styleUrls: ['./statistical.component.css']
})
export class StatisticalComponent implements OnInit {

  statisticalDates!: Statistical[];
  statisticalDatesTable!: Statistical[];
  listDataDate!: MatTableDataSource<Statistical>;
  lengthDate!: number;
  columnsDate: string[] = ['index', 'date', 'count', 'amount'];

  statisticalMonths!: Statistical[];
  statisticalMonthsTable!: Statistical[];
  listDataMonth!: MatTableDataSource<Statistical>;
  lengthMonth!: number;
  columnsMonth: string[] = ['index', 'date', 'count', 'amount'];

  statisticalYearsTable!: Statistical[];
  listDataYear!: MatTableDataSource<Statistical>;
  lengthYears!: number;
  columnsYears: string[] = ['index', 'date', 'count', 'amount'];
  statisticalYear!: Statistical[];

  @ViewChild('sortMonth') sortMonth!: MatSort;
  @ViewChild('MatPaginatorMonth') paginatorMonth!: MatPaginator;
  @ViewChild('sortDate') sortDate!: MatSort;
  @ViewChild('MatPaginatorDate') paginatorDate!: MatPaginator;
  @ViewChild('sortYear') sortYear!: MatSort;
  @ViewChild('MatPaginatorYear') paginatorYear!: MatPaginator;


  labelsDate: any[] = [];
  dataDate: number[] = [];

  labelsMonth: any[] = [];
  dataMonth: number[] = [];

  labelsYear: any[] = [];
  dataYear: number[] = [];

  myChartLine!: Chart<any, any, any>;
  myChartBar!: Chart<any, any, any>;
  myCharDoughnut!: Chart<any, any, any>;

  user!:User;
  image!:string;

  constructor(private datepipe: DatePipe, private statisticalService: StatisticalService, private toastr: ToastrService, private sessionService: SessionStorageService) { }

  ngOnInit(): void {
    this.checkLogin();
    Chart.register(...registerables);
    this.getStatisticalAllDate();
    this.getStatisticalMonth();
    this.getStatisticalYear();
  }

  checkLogin() {
    this.user = this.sessionService.getSession() as User;
    if(this.user==null) {
      window.location.href = ('/login');
    } else {
      this.image = this.user.image;
    }
  }

  logout() {
    this.sessionService.deleteSession();
    window.location.href = '/login';
  }

  getStatisticalAllDate() {
    this.statisticalService.getDate().subscribe(data => {
      //chart
      this.statisticalDates = data as Statistical[];
      this.statisticalDates.forEach(item => {
        this.dataDate.push(item.amount),
          this.labelsDate.push(this.datepipe.transform(item.date, 'dd/MM/yyyy'));
      })
      this.loadChartLineDate();

      //table
      this.statisticalDatesTable = this.statisticalDates;
      this.statisticalDatesTable.sort((o1,o2) =>  {
        if(o1.date<o2.date) {
          return 1;
        }
        if(o1.date>o2.date) {
          return -1;
        }
        return 0;
      });
      this.listDataDate = new MatTableDataSource(this.statisticalDatesTable);
      this.lengthDate = this.statisticalDatesTable.length;
      this.listDataDate.sort = this.sortDate;
      this.listDataDate.paginator = this.paginatorDate;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  getStatisticalMonth() {
    this.statisticalService.getMonth().subscribe(data => {
      //chart
      this.statisticalMonths = data as Statistical[];
      this.statisticalMonths.sort((o1,o2) =>  {
        if(o1.date>o2.date) {
          return 1;
        }
        if(o1.date<o2.date) {
          return -1;
        }
        return 0;
      });
      this.statisticalMonths.forEach(item => {
        this.dataMonth.push(item.amount),
        this.labelsMonth.push(this.datepipe.transform(item.date, 'MM/yyyy'));
      })
      this.loadChartLineMonth();

      //table
      this.statisticalMonthsTable = this.statisticalMonths;
      this.statisticalMonthsTable.sort((o1,o2) =>  {
        if(o1.date<o2.date) {
          return 1;
        }
        if(o1.date>o2.date) {
          return -1;
        }
        return 0;
      });
      this.listDataMonth = new MatTableDataSource(this.statisticalMonthsTable);
      this.lengthMonth = this.statisticalMonthsTable.length;
      this.listDataMonth.sort = this.sortMonth;
      this.listDataMonth.paginator = this.paginatorMonth;
    }, error => {
      this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
    })
  }

  getStatisticalYear() {
    this.statisticalService.getYear().subscribe(data=>{
      this.statisticalYear = data as Statistical[];
      this.listDataYear = new MatTableDataSource(this.statisticalYear);
      this.lengthYears = this.statisticalYear.length;
      this.listDataYear.sort = this.sortYear;
      this.listDataYear.paginator = this.paginatorYear;
      this.statisticalYear.forEach(item=>{
        this.dataYear.push(item.amount);
        this.labelsYear.push('Năm '+ this.datepipe.transform(item.date, 'yyyy'))
      })
      this.loadChartDoughnutYear();
    }, error=>{
      this.toastr.error('Lỗi! '+error.status, 'Hệ thống');
    })
  }

  loadChartLineDate() {
    const ctx = document.getElementById('chartDate') as HTMLCanvasElement;
    const gradient = ctx.getContext('2d')!.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#42e695');
    gradient.addColorStop(1, '#3bb2b8');

    this.myChartLine = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labelsDate,
        datasets: [{
          label: 'Doanh thu theo ngày',
          data: this.dataDate,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#3bb2b8',
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#3bb2b8',
          pointRadius: 6,
          pointHoverRadius: 10,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#3bb2b8',
              font: { size: 16, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu theo ngày',
            color: '#3bb2b8',
            font: { size: 20, weight: 'bold' }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#fff',
            titleColor: '#3bb2b8',
            bodyColor: '#222',
            borderColor: '#3bb2b8',
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { color: '#e0f7fa', borderDash: [5, 5] },
            ticks: { color: '#3bb2b8', font: { size: 13 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#e0f7fa', borderDash: [5, 5] },
            ticks: { color: '#3bb2b8', font: { size: 13 } }
          }
        }
      }
    });
  }

  loadChartLineMonth() {
    const ctx = document.getElementById('chartMonth') as HTMLCanvasElement;
    const gradient = ctx.getContext('2d')!.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#ffaf7b');
    gradient.addColorStop(1, '#d76d77');

    this.myChartBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labelsMonth,
        datasets: [{
          label: 'Doanh thu theo tháng',
          data: this.dataMonth,
          backgroundColor: gradient,
          borderColor: '#d76d77',
          borderWidth: 3,
          borderRadius: 12,
          hoverBackgroundColor: '#ffaf7b',
          hoverBorderColor: '#d76d77'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#d76d77',
              font: { size: 16, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu theo tháng',
            color: '#d76d77',
            font: { size: 20, weight: 'bold' }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#fff',
            titleColor: '#d76d77',
            bodyColor: '#222',
            borderColor: '#d76d77',
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { color: '#ffe0b2', borderDash: [5, 5] },
            ticks: { color: '#d76d77', font: { size: 13 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#ffe0b2', borderDash: [5, 5] },
            ticks: { color: '#d76d77', font: { size: 13 } }
          }
        }
      }
    });
  }

  loadChartDoughnutYear() {
    const ctx = document.getElementById('chartYear') as HTMLCanvasElement;
    this.myCharDoughnut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.labelsYear,
        datasets: [{
          label: 'Doanh thu theo năm',
          data: this.dataYear,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(43, 99, 71, 0.7)',
            'rgba(43, 255, 222, 0.7)',
            'rgba(43, 113, 222, 0.7)',
            'rgba(43, 13, 222, 0.7)'
          ],
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 12
        }]
      },
      options: {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#222',
        font: { size: 15, weight: 'bold' }
      }
    },
    title: {
      display: true,
      text: 'Tỷ lệ doanh thu theo năm',
      color: '#222',
      font: { size: 20, weight: 'bold' }
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#fff',
      titleColor: '#222',
      bodyColor: '#222',
      borderColor: '#222',
      borderWidth: 1,
      padding: 12
    }
  }
}
    });
  }

  finish() {
    this.ngOnInit();
  }

}
