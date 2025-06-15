import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImageUploadDialogComponent } from './product-image-upload-dialog.component';

describe('ProductImageUploadDialogComponent', () => {
  let component: ProductImageUploadDialogComponent;
  let fixture: ComponentFixture<ProductImageUploadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductImageUploadDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductImageUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
