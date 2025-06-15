import { Customer } from "./Customer";

export class Cart {
    id: number;
    amount: number;
    address?: string; // Thêm dấu ? để thuộc tính này là tùy chọn
    phone?: string;  // Thêm dấu ? để thuộc tính này là tùy chọn
    status?: boolean; // Thêm dấu ? để thuộc tính này là tùy chọn
    user?: Customer;  // Thêm dấu ? để thuộc tính này là tùy chọn

    constructor(id: number) {
        this.id = id;
        this.amount = 0; // Khởi tạo giá trị mặc định
    }
}
