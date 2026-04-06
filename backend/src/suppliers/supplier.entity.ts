import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column({ name: 'business_name', type: 'varchar', length: 100 })
  businessName: string; // Razón social

  @Column({ type: 'varchar', length: 50 })
  ruc: string; // RUC del proveedor

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'contact_person', type: 'varchar', length: 100, nullable: true })
  contactPerson: string; // Persona de contacto

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}