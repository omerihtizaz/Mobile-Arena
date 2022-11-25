import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Category } from './entity/category.entity';
import { CreateCategoryService } from './dtos/create-category.dto';

@Injectable()
export class CategoriesService {
  // must have a instance of the repo of category
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  // create method takes the argument of CreateCategoryService
  // and will first check if the category already exist with the name
  // if it does, it will throw an error
  // else, will create the instance of the category

  async create(dto: CreateCategoryService) {
    const alreadyExist = await this.repo.findOneBy({ name: Equal(dto.name) });
    if (alreadyExist) {
      throw new BadRequestException('The category already exist');
    }
    const category = await this.repo.create(dto);
    return await this.repo.save(category);
  }

  // remove will first check if the category of such id does indeed exist or not
  // if it does not exist it will throw an error
  // else it will remove that instance

  async remove(id: Number) {
    var category = await this.repo.findOneBy({ id: Equal(id) });
    if (!category) {
      throw new BadRequestException('Category does not exist');
    }
    return this.repo.remove(category);
  }

  // find method will find a category from the repository
  async find(name: String) {
    return await this.repo.find({ where: { name: Equal(name) } });
  }
}
