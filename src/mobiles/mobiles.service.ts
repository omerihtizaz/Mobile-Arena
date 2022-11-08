import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Mobile } from './mobile.entity';
import { CreateMobileDto } from './dtos/create-mobile.dto';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/user.entity';
@Injectable()
export class MobilesService {
  constructor(
    @InjectRepository(Mobile) private repo: Repository<Mobile>,
    private categoryService: CategoriesService,
  ) {}

  async findOne(name: string) {
    if (!name) {
      return null;
    }
    var mobile = await this.repo.findOne({
      where: { name: Equal(name) },
      relations: ['user'],
    });
    if (!mobile) {
      return null;
    }
    return mobile;
  }

  async create(dto: CreateMobileDto, user: User) {
    const mobile = this.repo.create(dto);
    if (dto.categories.length >= 2) {
      const c1 = await this.categoryService.find('public');
      const c2 = await this.categoryService.find('private');
      mobile.categories = [c1[0], c2[0]];
    } else if (dto.categories.toString() === 'public') {
      const c1 = await this.categoryService.find('public');
      mobile.categories = c1;
    } else {
      const c1 = await this.categoryService.find('private');
      mobile.categories = c1;
    }
    mobile.user = user;
    return await this.repo.save(mobile);
  }

  async update(name: string, attrs: Partial<Mobile>) {
    var mobile = await this.repo.findOneBy({ name: Equal(name) });
    if (!mobile) {
      throw new Error('No mobile found with name: ' + name);
    }
    Object.assign(mobile, attrs);
    return this.repo.save(mobile);
  }

  async remove(name: string) {
    var mobile = await this.repo.findOneBy({ name: Equal(name) });
    if (!mobile) {
      throw new Error('No mobile found with name: ' + name);
    }
    return this.repo.remove(mobile);
  }

  async getCategoryMobiles(categoryID: Number) {
    var results = await this.repo.find({
      relations: {
        categories: true,
      },
    });

    let i = 0;
    var finalresults = [];
    for (i; i < results.length; i++) {
      if (results[i].categories.length == 2) {
        for (var cat_index = 0; cat_index < 2; cat_index++) {
          if (results[i].categories[cat_index].id == categoryID) {
            finalresults.push(results[i]);
          }
        }
      } else {
        if (results[i].categories[0].id == categoryID) {
          finalresults.push(results[i]);
        }
      }
    }
    return finalresults;
  }

  async getMyMobiles(userID: Number) {
    return await this.repo
      .createQueryBuilder()
      .select('*')
      .andWhere('userID = :userID', { userID })
      .getRawMany();
  }

  async deleteMobile(name: string, userID: Number) {
    const mobile = await this.findOne(name);
    console.log(await mobile.user);
    if (!mobile || mobile.user.id != userID) {
      return new Error('Forbidden Resource!');
    }
    return this.repo.remove(mobile);
  }
}
