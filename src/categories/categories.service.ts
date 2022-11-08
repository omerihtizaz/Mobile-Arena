import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryService } from './dtos/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async create(dto: CreateCategoryService) {
    const category = await this.repo.create(dto);
    return await this.repo.save(category);
  }
  async remove(id: Number) {
    var category = await this.repo.findOneBy({ id: Equal(id) });
    if (!category) {
      // throw new NotFoundException();
      return null;
    }
    return this.repo.remove(category);
  }
  async find(name: String) {
    return await this.repo.find({ where: { name: Equal(name) } });
  }
}
