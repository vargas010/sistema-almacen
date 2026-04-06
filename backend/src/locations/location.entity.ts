import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('locations')
export class Location extends BaseEntity {
  @Column({ name: 'warehouse_number', type: 'varchar', length: 10 })
  warehouseNumber: string; // Número de bodega

  @Column({ name: 'aisle_section', type: 'varchar', length: 10 })
  aisleSection: string; // Sección de pasillo

  @Column({ name: 'shelf_number', type: 'varchar', length: 10 })
  shelfNumber: string; // Número de estante

  @Column({ type: 'text', nullable: true })
  description: string; // Descripción adicional

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}