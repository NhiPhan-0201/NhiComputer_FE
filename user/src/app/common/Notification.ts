export class Notification {
  id!: number;
  userId!: number;
  orderId!: number;
  message!: string;
  status!: number; // 0: chưa đọc, 1: đã đọc
  createdAt!: Date;
}
