import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService, CategoryDto } from './categories.service';

class UpdateCategoryDto extends PartialType(CategoryDto) {}


@Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService) {}

  @Get() findAll() { return this.svc.findAll(); }

  @UseGuards(JwtAuthGuard) @Post() create(@Body() dto: CategoryDto) { return this.svc.create(dto); }

  @UseGuards(JwtAuthGuard) @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) { return this.svc.update(id, dto); }

  @UseGuards(JwtAuthGuard) @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
