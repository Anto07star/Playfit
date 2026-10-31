import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from './admin.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private log = new Logger('Auth');
  constructor(
    @InjectRepository(Admin) private admins: Repository<Admin>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Creates the first admin from .env if there are no admins yet
  async onModuleInit() {
    if ((await this.admins.count()) > 0) return;
    const email = this.config.get('ADMIN_EMAIL', 'admin@playfit.in').toLowerCase();
    const password = this.config.get('ADMIN_PASSWORD', 'Admin@123');
    await this.admins.save(this.admins.create({ email, passwordHash: await bcrypt.hash(password, 10), name: 'PlayFit Admin' }));
    this.log.log(`Admin account created: ${email}`);
  }

  async login(email: string, password: string) {
    const admin = await this.admins.findOneBy({ email: email.toLowerCase().trim() });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException('Wrong email or password');
    }
    return {
      token: await this.jwt.signAsync({ sub: admin.id, email: admin.email }),
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }
}
