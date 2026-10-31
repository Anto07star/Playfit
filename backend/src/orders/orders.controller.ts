import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto, UpdateOrderDto, VerifyPaymentDto } from './order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private svc: OrdersService) {}

  // ----- public (no login needed) -----
  @Get('config') config() { return this.svc.publicConfig(); }
  @Post() create(@Body() dto: CreateOrderDto) { return this.svc.create(dto); }
  @Post('verify') verify(@Body() dto: VerifyPaymentDto) { return this.svc.verifyPayment(dto); }
  @Get('track') track(@Query('orderNumber') n: string, @Query('phone') p: string) { return this.svc.track(n, p); }

  // ----- admin -----
  @UseGuards(JwtAuthGuard) @Get('admin/all') adminList(@Query() q: Record<string, string>) { return this.svc.adminList(q); }
  @UseGuards(JwtAuthGuard) @Get('admin/stats') stats() { return this.svc.stats(); }
  @UseGuards(JwtAuthGuard) @Patch('admin/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) { return this.svc.adminUpdate(id, dto); }
}
