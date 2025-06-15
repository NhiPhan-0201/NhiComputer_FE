import { Cart } from "./Cart";
import { Product } from "./Product";

export class CartDetail {
    id: number;
    quantity: number;
    price: number;
    product: Product;
    cart: Cart;
    selected: boolean; // <-- Thêm dòng này

    constructor(id:number, quantity:number, price:number, product:Product, cart: Cart, selected: boolean = false) {
        this.id = id;
        this.quantity = quantity;
        this.price = price;
        this.product = product;
        this.cart = cart;
        this.selected = selected; // <-- Thêm dòng này
    }
}
