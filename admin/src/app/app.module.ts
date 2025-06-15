import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Route, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule } from 'ngx-toastr';
import {MatSelectModule} from '@angular/material/select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { AppComponent } from './app.component';
import { EditCategoryComponent } from './components/edit-category/edit-category.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { ProductsComponent } from './components/products/products.component';
import { OrdersComponent } from './components/orders/orders.component';
import { UsersComponent } from './components/users/users.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { EditProductComponent } from './components/edit-product/edit-product.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { OrderActionComponent } from './components/order-action/order-action.component';
import { StatisticalComponent } from './components/statistical/statistical.component';
import { RatesComponent } from './components/rates/rates.component';
import { LoginComponent } from './components/login/login.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { SubcategoriesComponent } from './components/subcategories/subcategories.component';
import { AddSubcategoryComponent } from './components/add-subcategory/add-subcategory.component';
import { EditSubcategoryComponent } from './components/edit-subcategory/edit-subcategory.component';
import { ProductImagesComponent } from './components/product-images/product-images.component';
import { ProductImageUploadDialogComponent } from './components/product-image-upload-dialog/product-image-upload-dialog.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { DiscountCodesComponent } from './components/discount-codes/discount-codes.component';



const routes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'statistical', component: StatisticalComponent },
  { path: 'rates', component: RatesComponent },
  { path: 'login', component: LoginComponent },
  {path:'subcategories', component: SubcategoriesComponent},
  {path:'product-images', component: ProductImagesComponent},
  {path:'feedback', component: FeedbackComponent},
  {path: 'discount-codes', component: DiscountCodesComponent},
  { path: '**', component: NotfoundComponent },
]

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CategoriesComponent,
    AddCategoryComponent,
    EditCategoryComponent,
    ProductsComponent,
    OrdersComponent,
    UsersComponent,
    AddProductComponent,
    EditProductComponent,
    AddUserComponent,
    EditUserComponent,
    OrderActionComponent,
    StatisticalComponent,
    RatesComponent,
    LoginComponent,
    NotfoundComponent,
    EditProfileComponent,
    SubcategoriesComponent,
    AddSubcategoryComponent,
    EditSubcategoryComponent,
    ProductImagesComponent,

    ProductImageUploadDialogComponent,
      FeedbackComponent,
      DiscountCodesComponent,
 ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    MatDialogModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ToastrModule.forRoot({
      timeOut: 2500,
      // progressBar: true,
      progressAnimation: 'increasing',
      // preventDuplicates: true,
      closeButton: true,
    }),
    RouterModule.forRoot(routes)
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
  // schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
