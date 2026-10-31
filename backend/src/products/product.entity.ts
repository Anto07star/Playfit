import { Column, CreateDateColumn, Entity, Index, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { numTransformer } from '../common/slug';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Index({ unique: true }) @Column() slug: string;
  @Column({ type: 'text', default: '' }) description: string;

  /** MRP / original price */
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numTransformer }) price: number;
  /** Selling price */
  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numTransformer }) salePrice: number;

  /** Image URLs or "/uploads/xyz.jpg" paths. First one is the main image. */
  @Column({ type: 'jsonb', default: () => "'[]'" }) images: string[];
  @Column({ type: 'jsonb', default: () => `'["S","M","L","XL","XXL"]'` }) sizes: string[];
  @Column({ type: 'int', default: 0 }) stock: number;
  @Column({ type: 'varchar', nullable: true }) season: string | null;
  @Column({ type: 'varchar', default: 'Premium Quality' }) version: string;
  @Column({ default: false }) isCustomizable: boolean;
  @Column({ default: false }) isFeatured: boolean;
  @Column({ default: true }) isActive: boolean;

  @Column({ type: 'int', nullable: true }) categoryId: number | null;
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @CreateDateColumn() createdAt: Date;
}
