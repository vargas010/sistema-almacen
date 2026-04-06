import { Entity, Column, Unique, BeforeInsert } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ 
    name: 'is_active', 
    type: 'boolean', 
    default: true 
  })
  isActive: boolean;

  @Column({ 
    name: 'role', 
    type: 'varchar', 
    length: 20, 
    default: 'admin' 
  })
  role: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}