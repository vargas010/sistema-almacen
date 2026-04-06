import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Location } from '@/locations/location.entity';
import { Supplier } from '@/suppliers/supplier.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code: string; // Código único del producto

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock: number;

  @Column({ 
    name: 'sale_price', 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0 
  })
  salePrice: number; // Precio de venta

  @Column({ 
    name: 'purchase_price', 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0 
  })
  purchasePrice: number; // Precio de compra (del proveedor)

  @Column({ 
    name: 'min_stock', 
    type: 'int', 
    default: 5 
  })
  minStock: number; // Stock mínimo para alertas

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Relación con Location (Muchos productos pertenecen a una ubicación)
  @ManyToOne(() => Location, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  // Relación con Supplier (Muchos productos pertenecen a un proveedor)
  @ManyToOne(() => Supplier, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;
}