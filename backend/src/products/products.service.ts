import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { slugify } from '../common/slug';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    @InjectRepository(Category) private cats: Repository<Category>,
  ) {}

  async list(q: Record<string, string>, admin = false) {
    const page = Math.max(1, parseInt(q.page) || 1);
    const limit = Math.min(60, Math.max(1, parseInt(q.limit) || 12));
    const qb = this.repo.createQueryBuilder('p').leftJoinAndSelect('p.category', 'c');
    qb.where(admin ? '1=1' : 'p.isActive = true');

    if (q.category) {
      const cat = await this.cats.findOneBy({ slug: q.category });
      if (!cat) return { items: [], total: 0, page, pages: 0 };
      const kids = await this.cats.findBy({ parentId: cat.id });
      qb.andWhere('p.categoryId IN (:...ids)', { ids: [cat.id, ...kids.map((k) => k.id)] });
    }
    if (q.search) qb.andWhere('(p.name ILIKE :s OR p.season ILIKE :s)', { s: `%${q.search}%` });
    if (q.season) qb.andWhere('p.season = :season', { season: q.season });
    if (q.version) qb.andWhere('p.version = :version', { version: q.version });
    if (q.featured === 'true') qb.andWhere('p.isFeatured = true');
    if (q.inStock === 'true') qb.andWhere('p.stock > 0');

    switch (q.sort) {
      case 'price_asc': qb.orderBy('p.salePrice', 'ASC'); break;
      case 'price_desc': qb.orderBy('p.salePrice', 'DESC'); break;
      case 'name': qb.orderBy('p.name', 'ASC'); break;
      default: qb.orderBy('p.createdAt', 'DESC');
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async filters() {
    const seasons = await this.repo.createQueryBuilder('p').select('DISTINCT p.season', 'season')
      .where('p.isActive = true AND p.season IS NOT NULL').orderBy('p.season', 'DESC').getRawMany();
    const versions = await this.repo.createQueryBuilder('p').select('DISTINCT p.version', 'version')
      .where('p.isActive = true').getRawMany();
    return { seasons: seasons.map((s) => s.season), versions: versions.map((v) => v.version) };
  }

  async bySlug(slug: string) {
    const p = await this.repo.findOne({ where: { slug, isActive: true } });
    if (!p) throw new NotFoundException('Jersey not found');
    return p;
  }

  async byId(id: number) {
    const p = await this.repo.findOneBy({ id });
    if (!p) throw new NotFoundException('Jersey not found');
    return p;
  }

  private async uniqueSlug(name: string, ignoreId?: number) {
    const base = slugify(name) || 'jersey';
    let slug = base, n = 1;
    for (;;) {
      const hit = await this.repo.findOneBy({ slug });
      if (!hit || hit.id === ignoreId) return slug;
      slug = `${base}-${++n}`;
    }
  }

  async create(dto: CreateProductDto) {
    const p = this.repo.create({
      ...dto,
      name: dto.name.trim(),
      slug: await this.uniqueSlug(dto.name),
      images: dto.images ?? [],
      sizes: dto.sizes?.length ? dto.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
      season: dto.season || null,
      categoryId: dto.categoryId ?? null,
    });
    const saved = await this.repo.save(p);
    return this.byId(saved.id);
  }

  async update(id: number, dto: UpdateProductDto) {
    const p = await this.byId(id);
    Object.assign(p, dto);
    if (dto.name && dto.name.trim() !== p.name) p.slug = await this.uniqueSlug(dto.name, id);
    if (dto.name) p.name = dto.name.trim();
    if ('season' in dto) p.season = dto.season || null;
    if ('categoryId' in dto) {
      p.categoryId = dto.categoryId ?? null;
      p.category = undefined; // avoid stale eager relation overriding the FK
    }
    await this.repo.save(p);
    return this.byId(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
