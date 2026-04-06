import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { Location } from '@/locations/location.entity';
import { Supplier } from '@/suppliers/supplier.entity';
import { LocationsModule } from '@/locations/locations.module';
import { SuppliersModule } from '@/suppliers/suppliers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Location, Supplier]),
    LocationsModule,
    SuppliersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}