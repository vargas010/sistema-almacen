import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const [locations, total] = await this.locationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: locations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const location = await this.locationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }

    return location;
  }

  async findByWarehouse(warehouseNumber: string) {
    return await this.locationRepository.find({
      where: { warehouseNumber, isActive: true },
      order: { aisleSection: 'ASC', shelfNumber: 'ASC' },
    });
  }

  async findUniqueLocation(warehouseNumber: string, aisleSection: string, shelfNumber: string) {
    const location = await this.locationRepository.findOne({
      where: {
        warehouseNumber,
        aisleSection,
        shelfNumber,
      },
    });

    return location;
  }

  async create(createLocationDto: CreateLocationDto) {
    // Verificar si ya existe una ubicación con la misma combinación
    const existingLocation = await this.findUniqueLocation(
      createLocationDto.warehouseNumber,
      createLocationDto.aisleSection,
      createLocationDto.shelfNumber,
    );

    if (existingLocation) {
      throw new ConflictException(
        `Ya existe una ubicación en Bodega ${createLocationDto.warehouseNumber}, ` +
        `Pasillo ${createLocationDto.aisleSection}, Estante ${createLocationDto.shelfNumber}`
      );
    }

    const location = this.locationRepository.create(createLocationDto);
    return await this.locationRepository.save(location);
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    const location = await this.findOne(id);

    // Si se están actualizando los campos de ubicación, verificar que no exista duplicado
    const warehouseNumber = updateLocationDto.warehouseNumber || location.warehouseNumber;
    const aisleSection = updateLocationDto.aisleSection || location.aisleSection;
    const shelfNumber = updateLocationDto.shelfNumber || location.shelfNumber;

    if (
      (updateLocationDto.warehouseNumber || updateLocationDto.aisleSection || updateLocationDto.shelfNumber) &&
      (warehouseNumber !== location.warehouseNumber ||
       aisleSection !== location.aisleSection ||
       shelfNumber !== location.shelfNumber)
    ) {
      const existingLocation = await this.findUniqueLocation(
        warehouseNumber,
        aisleSection,
        shelfNumber,
      );

      if (existingLocation && existingLocation.id !== id) {
        throw new ConflictException(
          `Ya existe una ubicación en Bodega ${warehouseNumber}, ` +
          `Pasillo ${aisleSection}, Estante ${shelfNumber}`
        );
      }
    }

    Object.assign(location, updateLocationDto);
    return await this.locationRepository.save(location);
  }

  async remove(id: string) {
    const location = await this.findOne(id);
    
    // Soft delete - solo desactivar
    location.isActive = false;
    await this.locationRepository.save(location);
    
    return { message: `Ubicación ${location.warehouseNumber}-${location.aisleSection}-${location.shelfNumber} desactivada correctamente` };
  }

  async activate(id: string) {
    const location = await this.findOne(id);
    location.isActive = true;
    await this.locationRepository.save(location);
    return { message: `Ubicación activada correctamente` };
  }

  async deletePermanently(id: string) {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
    return { message: `Ubicación eliminada permanentemente` };
  }

  async getActiveLocations() {
    return await this.locationRepository.find({
      where: { isActive: true },
      order: { warehouseNumber: 'ASC', aisleSection: 'ASC', shelfNumber: 'ASC' },
    });
  }
}