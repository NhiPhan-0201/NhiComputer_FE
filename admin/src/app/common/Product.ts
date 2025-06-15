import { Category } from "./Category";
import { Subcategory } from "./Subcategory";

export class Product {
    'productId':number;
    'name':string;
    'quantity': number;
    'price': number;
    'discount':number;
    'image': string;
    'description': string;
    'enteredDate': Date;
    'category': Category;
    'subcategory': Subcategory;
    'status': boolean;
}
