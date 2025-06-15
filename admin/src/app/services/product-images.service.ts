import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProductImage } from '../common/ProductImage';
import { getAllJSDocTags } from 'typescript';

@Injectable({
  providedIn: 'root'
})
export class ProductImageService {
  constructor(private http: HttpClient) { }

  // Lấy tất cả hình ảnh sản phẩm
  private apiUrl = 'http://localhost:8989/api/product-images';

getAll(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.apiUrl}/by-product/${productId}`);
  }

  // ✅ Lấy tất cả hình ảnh
  getAllImages(): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(this.apiUrl);
  }

  // Upload hình ảnh
  upload(productId: number, file: File): Observable<ProductImage> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('productId', productId.toString());
    return this.http.post<ProductImage>(this.apiUrl, formData);
  }

  // Xóa hình ảnh
  delete(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${imageId}`);
  }
}
