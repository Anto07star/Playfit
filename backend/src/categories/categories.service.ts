import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Repository } from 'typeorm';
import { slugify } from '../common/slug';
import { Category } from './category.entity';

export class CategoryDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsInt() parentId?: number | null;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  private async uniqueSlug(name: string, ignoreId?: number) {
    const base = slugify(name) || 'category';
    let slug = base, n = 1;
    for (;;) {
      const hit = await this.repo.findOneBy({ slug });
      if (!hit || hit.id === ignoreId) return slug;
      slug = `${base}-${++n}`;
    }
  }

  async create(dto: CategoryDto) {
    return this.repo.save(
      this.repo.create({ name: dto.name.trim(), slug: await this.uniqueSlug(dto.name), parentId: dto.parentId ?? null, sortOrder: dto.sortOrder ?? 0 }),
    );
  }

  async update(id: number, dto: Partial<CategoryDto>) {
    const c = await this.repo.findOneBy({ id });
    if (!c) throw new NotFoundException('Category not found');
    if (dto.name && dto.name.trim() !== c.name) {
      c.name = dto.name.trim();
      c.slug = await this.uniqueSlug(c.name, id);
    }
    if (dto.parentId !== undefined) c.parentId = dto.parentId === id ? null : dto.parentId;
    if (dto.sortOrder !== undefined) c.sortOrder = dto.sortOrder;
    return this.repo.save(c);
  }

  async remove(id: number) {
    await this.repo.update({ parentId: id }, { parentId: null });
    await this.repo.delete(id);
    return { deleted: true };
  }
}
