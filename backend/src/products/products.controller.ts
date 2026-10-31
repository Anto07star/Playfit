import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  // ----- public -----
  @Get() list(@Query() q: Record<string, string>) { return this.svc.list(q); }
  @Get('filters') filters() { return this.svc.filters(); }

  // ----- admin (declared before :slug so they don't clash) -----
  @UseGuards(JwtAuthGuard) @Get('admin/all')
  adminList(@Query() q: Record<string, string>) { return this.svc.list(q, true); }

  @UseGuards(JwtAuthGuard) @Get('admin/:id')
  adminOne(@Param('id', ParseIntPipe) id: number) { return this.svc.byId(id); }

  @UseGuards(JwtAuthGuard) @Post()
  create(@Body() dto: CreateProductDto) { return this.svc.create(dto); }

  @UseGuards(JwtAuthGuard) @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) { return this.svc.update(id, dto); }

  @UseGuards(JwtAuthGuard) @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

  @Get(':slug') one(@Param('slug') slug: string) { return this.svc.bySlug(slug); }
}
