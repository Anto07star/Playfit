import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
  @Column({ default: 'Admin' }) name: string;
}
