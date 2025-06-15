import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductImage } from '../common/ProductImage';
import { Product } from '../common/Product';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  url = 'http://localhost:8989/api/products';

  constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get(this.url);
  }

getProductImages(productId: number): Observable<ProductImage[]> {
  return this.httpClient.get<ProductImage[]>(`http://localhost:8989/api/products/images/${productId}`);
}
 getOne(productId: number): Observable<Product> {
  return this.httpClient.get<Product>(`http://localhost:8989/api/products/${productId}`);
}

  getByCategory(id:number) {
    return this.httpClient.get(this.url+'/by-category/'+id);
  }
  getBestSelling(limit: number = 4) {
    return this.httpClient.get('http://localhost:8989/api/best-selling?limit=' + limit);
  }

  getProducts() {

    return this.httpClient.get(this.url);
  }
  filterProducts(name: string = '', sort: string = '', priceRange: string = '', categoryId?: number) {
  let params = [];
  if (name) params.push(`name=${encodeURIComponent(name)}`);
  if (sort) params.push(`sort=${sort}`);
  if (priceRange) params.push(`priceRange=${priceRange}`);
  if (categoryId) params.push(`categoryId=${categoryId}`);
  let query = params.length ? '?' + params.join('&') : '';
  return this.httpClient.get(`${this.url}/filter${query}`);
}
filterSubSubProducts(name: string, sort: string, priceRange: string, subcategoryId: string = '') {
  let params: any = { name, sort, priceRange };
  if (subcategoryId) params.subcategoryId = subcategoryId;
  return this.httpClient.get(`${this.url}/filter`, { params });
}
filterProductsByCategory(categoryId: number, name: string, sort: string, priceRange: string) {
  return this.httpClient.get(`/api/products/filter?categoryId=${categoryId}&name=${name}&sort=${sort}&priceRange=${priceRange}`);
}
}
