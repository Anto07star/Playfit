import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';
import { In, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { CreateOrderDto, UpdateOrderDto, VerifyPaymentDto } from './order.dto';
import { Order, OrderItem } from './order.entity';

@Injectable()
export class OrdersService {
  private razor: Razorpay | null = null;
  private keyId: string;
  private keySecret: string;
  private shippingFee: number;
  private customFee: number;

  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(Product) private products: Repository<Product>,
    config: ConfigService,
  ) {
    this.keyId = config.get('RAZORPAY_KEY_ID', '');
    this.keySecret = config.get('RAZORPAY_KEY_SECRET', '');
    if (this.keyId && this.keySecret) this.razor = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    this.shippingFee = +config.get('SHIPPING_FEE', '0');
    this.customFee = +config.get('CUSTOM_FEE', '150');
  }

  publicConfig() {
    return { onlineEnabled: !!this.razor, keyId: this.razor ? this.keyId : null, shippingFee: this.shippingFee, customFee: this.customFee };
  }

  private async reduceStock(order: Order) {
    if (order.stockReduced) return;
    for (const it of order.items) await this.products.decrement({ id: it.productId }, 'stock', it.qty);
    order.stockReduced = true;
  }

  private async restoreStock(order: Order) {
    if (!order.stockReduced) return;
    for (const it of order.items) await this.products.increment({ id: it.productId }, 'stock', it.qty);
    order.stockReduced = false;
  }

  async create(dto: CreateOrderDto) {
    if (dto.paymentMethod === 'ONLINE' && !this.razor) {
      throw new BadRequestException('Online payment is not available right now. Please choose Cash on Delivery.');
    }
    const found = await this.products.find({ where: { id: In(dto.items.map((i) => i.productId)), isActive: true } });
    const byId = new Map(found.map((p) => [p.id, p]));

    const items: OrderItem[] = [];
    const wanted = new Map<number, number>();
    for (const it of dto.items) {
      const p = byId.get(it.productId);
      if (!p) throw new BadRequestException('A jersey in your cart is no longer available. Please refresh your cart.');
      if (!p.sizes.includes(it.size)) throw new BadRequestException(`Size ${it.size} is not available for ${p.name}`);
      wanted.set(p.id, (wanted.get(p.id) || 0) + it.qty);
      if (wanted.get(p.id) > p.stock) throw new BadRequestException(`Only ${p.stock} left in stock for ${p.name}`);
      const custom = p.isCustomizable && (it.customName?.trim() || it.customNumber);
      items.push({
        productId: p.id,
        name: p.name,
        image: p.images?.[0] ?? null,
        size: it.size,
        qty: it.qty,
        unitPrice: p.salePrice + (custom ? this.customFee : 0),
        ...(custom ? { customName: it.customName?.trim().toUpperCase() || undefined, customNumber: it.customNumber || undefined } : {}),
      });
    }

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const total = subtotal + this.shippingFee;
    const orderNumber = 'PF' + Date.now().toString(36).toUpperCase() + randomBytes(2).toString('hex').toUpperCase();

    const order = this.orders.create({
      orderNumber,
      customerName: dto.customerName.trim(),
      phone: dto.phone,
      email: dto.email || null,
      address: dto.address.trim(),
      city: dto.city.trim(),
      state: dto.state.trim(),
      pincode: dto.pincode,
      items, subtotal, shipping: this.shippingFee, total,
      paymentMethod: dto.paymentMethod,
      paymentStatus: 'PENDING',
      status: 'PLACED',
    });

    let razorpay = null;
    if (dto.paymentMethod === 'ONLINE') {
      try {
        const rz = await this.razor.orders.create({ amount: Math.round(total * 100), currency: 'INR', receipt: orderNumber });
        order.razorpayOrderId = rz.id;
        razorpay = { orderId: rz.id, amount: rz.amount, currency: rz.currency, keyId: this.keyId };
      } catch (e: any) {
        throw new BadRequestException('Could not start online payment: ' + (e?.error?.description || e.message));
      }
    } else {
      await this.reduceStock(order); // COD reserves stock right away
    }
    const saved = await this.orders.save(order);
    return { order: saved, razorpay };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const order = await this.orders.findOneBy({ razorpayOrderId: dto.razorpay_order_id });
    if (!order) throw new NotFoundException('Order not found');
    const expected = createHmac('sha256', this.keySecret).update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`).digest('hex');
    const a = Buffer.from(expected), b = Buffer.from(dto.razorpay_signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      order.paymentStatus = 'FAILED';
      await this.orders.save(order);
      throw new BadRequestException('Payment verification failed');
    }
    order.paymentStatus = 'PAID';
    order.razorpayPaymentId = dto.razorpay_payment_id;
    if (order.status === 'PLACED') order.status = 'CONFIRMED';
    await this.reduceStock(order);
    return this.orders.save(order);
  }

  async track(orderNumber: string, phone: string) {
    const order = await this.orders.findOneBy({ orderNumber: (orderNumber || '').trim().toUpperCase(), phone: (phone || '').trim() });
    if (!order) throw new NotFoundException('No order found with those details');
    return order;
  }

  // ---------- admin ----------
  async adminList(q: Record<string, string>) {
    const page = Math.max(1, parseInt(q.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(q.limit) || 15));
    const qb = this.orders.createQueryBuilder('o').orderBy('o.createdAt', 'DESC');
    qb.where('1=1');
    if (q.status) qb.andWhere('o.status = :st', { st: q.status });
    if (q.search) qb.andWhere('(o.orderNumber ILIKE :s OR o.customerName ILIKE :s OR o.phone ILIKE :s)', { s: `%${q.search}%` });
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async adminUpdate(id: number, dto: UpdateOrderDto) {
    const order = await this.orders.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');
    if (dto.paymentStatus) order.paymentStatus = dto.paymentStatus;
    if (dto.status) {
      order.status = dto.status;
      if (dto.status === 'CANCELLED') await this.restoreStock(order);
      if (dto.status === 'DELIVERED' && order.paymentMethod === 'COD') order.paymentStatus = 'PAID';
    }
    return this.orders.save(order);
  }

  async stats() {
    const [totalOrders, pending, productCount] = await Promise.all([
      this.orders.count(),
      this.orders.count({ where: { status: 'PLACED' } }),
      this.products.count(),
    ]);
    const rev = await this.orders.createQueryBuilder('o').select('COALESCE(SUM(o.total),0)', 'sum').where("o.status <> 'CANCELLED'").getRawOne();
    const recent = await this.orders.find({ order: { createdAt: 'DESC' }, take: 6 });
    const lowStock = await this.products.createQueryBuilder('p').where('p.stock <= 5').orderBy('p.stock', 'ASC').take(8).getMany();
    return { totalOrders, pending, productCount, revenue: parseFloat(rev.sum), recent, lowStock };
  }
}
