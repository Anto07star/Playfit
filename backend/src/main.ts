import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { Client } from 'pg';
import { AppModule } from './app.module';

// Creates the "playfit" database automatically if it doesn't exist yet.
async function ensureDatabase() {
  if (process.env.DATABASE_URL) return; // hosted DB (Neon etc.) already exists
  const { DB_HOST = 'localhost', DB_PORT = '5432', DB_USER = 'postgres', DB_PASSWORD = 'postgres', DB_NAME = 'playfit' } = process.env;
  const client = new Client({ host: DB_HOST, port: +DB_PORT, user: DB_USER, password: DB_PASSWORD, database: 'postgres' });
  try {
    await client.connect();
    const r = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
    if (!r.rowCount) {
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database "${DB_NAME}" created`);
    }
  } catch (e: any) {
    console.error(`\nCould not connect to PostgreSQL at ${DB_HOST}:${DB_PORT} as "${DB_USER}".\nCheck DB_USER / DB_PASSWORD in backend/.env and that PostgreSQL is running.\n${e.message}\n`);
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function bootstrap() {
  await ensureDatabase();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploads = join(process.cwd(), 'uploads');
  mkdirSync(uploads, { recursive: true });
  app.useStaticAssets(uploads, { prefix: '/uploads' });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = +(process.env.PORT || 4000);
  await app.listen(port);
  console.log(`PlayFit API running on http://localhost:${port}/api`);
}
bootstrap();
