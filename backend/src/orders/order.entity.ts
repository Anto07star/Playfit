import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { numTransformer } from '../common/slug';

export interface OrderItem {
  productId: number;
  name: string;
  image: string | null;
  size: string;
  qty: number;
  unitPrice: number;
  customName?: string;
  customNumber?: string;
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export const ORDER_STATUSES: OrderStatus[] = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED'];

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) orderNumber: string;

  @Column() customerName: string;
  @Column() phone: string;
  @Column({ type: 'varchar', nullable: true }) email: string | null;
  @Column({ type: 'text' }) address: string;
  @Column() city: string;
  @Column() state: string;
  @Column() pincode: string;

  @Column({ type: 'jsonb' }) items: OrderItem[];
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numTransformer }) subtotal: number;
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numTransformer }) shipping: number;
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numTransformer }) total: number;

  @Column({ type: 'varchar', default: 'COD' }) paymentMethod: 'COD' | 'ONLINE';
  @Column({ type: 'varchar', default: 'PENDING' }) paymentStatus: PaymentStatus;
  @Column({ type: 'varchar', default: 'PLACED' }) status: OrderStatus;
  @Column({ type: 'varchar', nullable: true }) razorpayOrderId: string | null;
  @Column({ type: 'varchar', nullable: true }) razorpayPaymentId: string | null;
  @Column({ default: false }) stockReduced: boolean;

  @CreateDateColumn() createdAt: Date;
}
