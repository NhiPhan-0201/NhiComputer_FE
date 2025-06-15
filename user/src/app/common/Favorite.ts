import { Customer } from "./Customer";
import { Product } from "./Product";

export class Favorite {
  favoriteId?: number;
  user: Customer;
  product: Product;
  createdAt?: Date;

  constructor(favoriteId: number, user: Customer, product: Product, createdAt?: Date) {
    this.favoriteId = favoriteId;
    this.user = user;
    this.product = product;
    this.createdAt = createdAt;
  }
}
