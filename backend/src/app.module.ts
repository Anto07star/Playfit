import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => {
        const url = c.get<string>('DATABASE_URL');
        // Hosted databases (Neon, Render, Supabase...) give one DATABASE_URL and need SSL.
        const connection = url
          ? { url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } }
          : {
              host: c.get('DB_HOST', 'localhost'),
              port: +c.get('DB_PORT', '5432'),
              username: c.get('DB_USER', 'postgres'),
              password: c.get('DB_PASSWORD', 'postgres'),
              database: c.get('DB_NAME', 'playfit'),
            };
        return {
          type: 'postgres' as const,
          ...connection,
          autoLoadEntities: true,
          synchronize: true, // auto-creates/updates tables
        };
      },
    }),
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    UploadModule,
  ],
})
export class AppModule {}
