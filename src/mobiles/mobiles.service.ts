import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Mobile } from './entity/mobile.entity';
import { CreateMobileDto } from './dtos/create-mobile.dto';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/entity/user.entity';
@Injectable()
export class MobilesService {
  constructor(
    @InjectRepository(Mobile) private repo: Repository<Mobile>,
    private categoryService: CategoriesService,
  ) {}
  // this function will return the mobiles of a user
  async findOne(name: string) {
    if (!name) {
      throw new BadRequestException('Mobile name is not provided');
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

  // this function will create a mobile, given a DTO and a user
  // it will first check for the categories in the DTO,
  // and get instances of the categories provided
  // if the categories do not exist, it will throw an error.
  // afterwards, it will assign the user to the mobile,
  //  and save it to the database.
  async create(dto: CreateMobileDto, user: User) {
    const mobile = this.repo.create(dto);
    if (dto.categories.length >= 2) {
      const c1 = await this.categoryService.find('public');
      const c2 = await this.categoryService.find('private');
      mobile.categories = [c1[0], c2[0]];
    } else if (dto.categories.toString() === 'public') {
      const c1 = await this.categoryService.find('public');
      mobile.categories = c1;
    } else if (dto.categories.toString() === 'private') {
      const c1 = await this.categoryService.find('private');
      mobile.categories = c1;
    } else {
      throw new BadRequestException(
        dto.categories.toString() + ' do not exist',
      );
    }
    mobile.user = user;

    return await this.repo.save(mobile);
  }
  // this function will update the mobile
  // first check for the mobile
  // if mobile doesnt exist, throw an error
  // if it does, assign those parameters to that mobile
  // and save the mobile back to the repo

  async update(name: string, attrs: Partial<Mobile>) {
    var mobile = await this.repo.findOneBy({ name: Equal(name) });
    if (!mobile) {
      throw new BadRequestException('No mobile found with name: ' + name);
    }
    Object.assign(mobile, attrs);
    return this.repo.save(mobile);
  }

  // this function will remove the mobile
  // first check for the mobile
  // if mobile doesnt exist, throw an error
  // if it does, remove that mobile from the repository
  async remove(name: string) {
    var mobile = await this.repo.findOneBy({ name: Equal(name) });
    if (!mobile) {
      throw new BadRequestException('No mobile found with name: ' + name);
    }
    return this.repo.remove(mobile);
  }

  // get categories of mobile
  // first get all results from the database
  // then check if the requirement is private or public
  // if private, then check for all the mobiles that are private,
  // and also those mobiles which are both private and public to show them
  // similar case for vice versa

  async getCategoryMobiles(name: String) {
    var results = await this.repo.find({
      relations: {
        categories: true,
      },
    });
    let category = await this.categoryService.find(name);
    let i = 0;
    var finalresults = [];
    results.map((result) => {
      console.log(result);
      if (result.categories.length == 2) {
        result.categories.map((cat) => {
          console.log(cat);
          if (cat.id == category[0].id) {
            finalresults.push(result);
          }
        });
      } else if (result.categories[0].id == category[0].id) {
        finalresults.push(result);
      }
    });
    return finalresults;
  }

  async getAllMobiles(page: number) {
    const take = 2;
    let skip = 2 * page - 1;
    return await this.repo
      .createQueryBuilder()
      .select('*')
      .orderBy({ name: 'ASC' })
      .skip(skip)
      .take(take)
      .getRawMany();
  }
  // get the mobiles for a current user
  // by using a query builder
  async getMyMobiles(userID: Number) {
    return await this.repo
      .createQueryBuilder()
      .select('*')
      .andWhere('userID = :userID', { userID })
      .getRawMany();
  }

  // delete a mobile,
  //  if the mobile doesnt exist,
  //  or the user is not logged in,
  //  or the user tries to delete a mobile of someone else,
  //   it will throw an error
  // else it will delete the mobile
  async deleteMobile(name: string, userID: Number) {
    const mobile = await this.findOne(name);
    if (!mobile) {
      throw new BadRequestException('Mobile does not exist');
    }
    if (mobile.user.id != userID) {
      throw new BadRequestException('You do not own this mobile');
    }
    return this.repo.remove(mobile);
  }
}
