export class Image {
  imageId: number;
  productId: number;
  imageUrl: string;

  constructor(imageId: number, productId: number, imageUrl: string) {
    this.imageId = imageId;
    this.productId = productId;
    this.imageUrl = imageUrl;
  }
}
