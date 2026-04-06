import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Location } from '@/locations/location.entity';
import { Supplier } from '@/suppliers/supplier.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const [products, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['location', 'supplier'],
    });

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['location', 'supplier'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async findByCode(code: string) {
    const product = await this.productRepository.findOne({
      where: { code },
      relations: ['location', 'supplier'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con código ${code} no encontrado`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    // Verificar si ya existe un producto con el mismo código
    const existingProduct = await this.productRepository.findOne({
      where: { code: createProductDto.code },
    });

    if (existingProduct) {
      throw new ConflictException(`Ya existe un producto con el código ${createProductDto.code}`);
    }

    // Buscar ubicación si se proporcionó
    let location: Location | null = null;
    if (createProductDto.locationId) {
      location = await this.locationRepository.findOne({
        where: { id: createProductDto.locationId },
      });
      if (!location) {
        throw new NotFoundException(`Ubicación con ID ${createProductDto.locationId} no encontrada`);
      }
    }

    // Buscar proveedor si se proporcionó
    let supplier: Supplier | null = null;
    if (createProductDto.supplierId) {
      supplier = await this.supplierRepository.findOne({
        where: { id: createProductDto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(`Proveedor con ID ${createProductDto.supplierId} no encontrado`);
      }
    }

    const product = this.productRepository.create({
      ...createProductDto,
      location,
      supplier,
    });

    return await this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    // Si se está actualizando el código, verificar que no exista otro producto con ese código
    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existingProduct = await this.productRepository.findOne({
        where: { code: updateProductDto.code },
      });
      if (existingProduct) {
        throw new ConflictException(`Ya existe un producto con el código ${updateProductDto.code}`);
      }
      product.code = updateProductDto.code;
    }

    // Si se está actualizando la ubicación
    if (updateProductDto.locationId) {
      const location = await this.locationRepository.findOne({
        where: { id: updateProductDto.locationId },
      });
      if (!location) {
        throw new NotFoundException(`Ubicación con ID ${updateProductDto.locationId} no encontrada`);
      }
      product.location = location;
    }

    // Si se está actualizando el proveedor
    if (updateProductDto.supplierId) {
      const supplier = await this.supplierRepository.findOne({
        where: { id: updateProductDto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(`Proveedor con ID ${updateProductDto.supplierId} no encontrado`);
      }
      product.supplier = supplier;
    }

    // Actualizar los demás campos (excluyendo los que ya manejamos)
    const { locationId, supplierId, ...rest } = updateProductDto;
    Object.assign(product, rest);

    return await this.productRepository.save(product);
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto) {
    const product = await this.findOne(id);

    const { quantity, operation } = updateStockDto;

    if (operation === 'add') {
      product.stock = (product.stock || 0) + quantity;
    } else if (operation === 'subtract') {
      if (product.stock < quantity) {
        throw new ConflictException(`Stock insuficiente. Stock actual: ${product.stock}, Cantidad a restar: ${quantity}`);
      }
      product.stock = product.stock - quantity;
    }

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    
    // Soft delete - solo desactivar el producto
    product.isActive = false;
    await this.productRepository.save(product);
    
    return { message: `Producto ${product.name} desactivado correctamente` };
  }

  async deletePermanently(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Producto ${product.name} eliminado permanentemente` };
  }

  async getLowStock(threshold?: number) {
    const minStock = threshold || 5;
    const products = await this.productRepository.find({
      where: { isActive: true },
      relations: ['location', 'supplier'],
      order: { stock: 'ASC' },
    });
    return products.filter(p => p.stock <= (p.minStock || minStock));
  }

  async search(searchTerm: string) {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.location', 'location')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .where('product.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('product.code ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('product.description ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }
}