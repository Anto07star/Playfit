import { BadRequestException, Controller, Module, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
import { createHash, randomBytes } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// If Cloudinary keys are set, images go to Cloudinary (survives free hosting restarts).
// Otherwise they are saved in the local "uploads" folder.
const useCloud = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const dest = join(process.cwd(), 'uploads');
if (!useCloud) mkdirSync(dest, { recursive: true });

async function toCloudinary(file: Express.Multer.File): Promise<string> {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'playfit';
  const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex');
  const fd = new FormData();
  fd.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
  fd.append('api_key', key);
  fd.append('timestamp', String(timestamp));
  fd.append('folder', folder);
  fd.append('signature', signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: fd });
  const json: any = await res.json();
  if (!res.ok) throw new BadRequestException(json?.error?.message || 'Image upload to Cloudinary failed');
  return json.secure_url;
}

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      storage: useCloud
        ? memoryStorage()
        : diskStorage({
            destination: dest,
            filename: (_req, file, cb) => cb(null, randomBytes(10).toString('hex') + extname(file.originalname).toLowerCase()),
          }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Only JPG, PNG, WEBP or GIF images are allowed'), false),
    }),
  )
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No file received');
    if (useCloud) return { urls: await Promise.all(files.map(toCloudinary)) };
    return { urls: files.map((f) => `/uploads/${f.filename}`) };
  }
}

@Module({ controllers: [UploadController] })
export class UploadModule {}
