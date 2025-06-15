export class ProductImage {
  imageId!: number;
  productId!: number;
  imageUrl!: string;
  uploadedDate!: Date;

  constructor(imageId: number, productId: number, imageUrl: string, uploadedDate: Date) {
    this.imageId = imageId;
    this.productId = productId;
    this.imageUrl = imageUrl;
    this.uploadedDate = uploadedDate;
  }
}
