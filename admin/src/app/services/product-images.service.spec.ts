import { TestBed } from '@angular/core/testing';

import { ProductImageService } from './product-images.service';

describe('ProductImagesService', () => {
  let service: ProductImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
