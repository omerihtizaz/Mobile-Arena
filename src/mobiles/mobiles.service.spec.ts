import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entity/category.entity';
import { UsersService } from '../users/users.service';
import { CreateMobileDto } from './dtos/create-mobile.dto';
import { Mobile } from './entity/mobile.entity';
import { MobilesService } from './mobiles.service';

describe('MobilesService', () => {
  let service: MobilesService;
  var fakeCatService;
  var fakeUserService;
  var fakeRepo;
  var database: Mobile[] = [];
  beforeEach(async () => {
    fakeCatService = {
      find: (name: string) => {
        if (name === 'public') {
          return Promise.resolve({ id: 1, name: name } as unknown as Category);
        }
        return Promise.resolve({ id: 2, name: name } as unknown as Category);
      },
    };

    fakeUserService = {};

    fakeRepo = {
      findOne: async (name: any) => {
        const filteredcategories = database.filter(
          async (category) =>
            (await Promise.resolve(category)).name === name.name.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      findOneBy: async (name: any) => {
        const filteredcategories = database.filter(
          async (category) =>
            (await Promise.resolve(category)).name === name.name.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      find: async (name: String) => {
        const filteredcategories = database.filter(
          async (category) => (await Promise.resolve(category)).name === name,
        );
        return await Promise.resolve(filteredcategories);
      },
      create: (dto: CreateMobileDto) => {
        var mobile = {
          id: Math.floor(Math.random() * 99999),
          name: dto.name,
          brand: dto.brand,
          specs: dto.specs,
          year: dto.year,
          price: dto.price,
          categories: dto.categories,
        } as unknown as Mobile;
        // database.push(mobile);
        return Promise.resolve(mobile);
      },
      remove: (to_remove: Mobile) => {
        const filteredcategories = database.filter(
          (mobiles) => mobiles.name == to_remove.name,
        );
        database = filteredcategories;
        return Promise.resolve(to_remove);
      },
      save: (dto: Mobile) => {
        database.push(dto);
        return Promise.resolve(dto);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobilesService,
        {
          provide: CategoriesService,
          useValue: fakeCatService,
        },
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: getRepositoryToken(Mobile),
          useValue: fakeRepo,
        },
      ],
    }).compile();
    database = [];
    service = module.get<MobilesService>(MobilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an instance of mobile when prompted', async () => {
    var user = {
      id: 1,
      name: 'Omer',
      email: 'omer@gmail.com',
      password: '123',
      admin: 1,
    } as unknown as User;

    var mobile = {
      id: Math.floor(Math.random() * 99999),
      name: 'A50',
      brand: 'Samsung',
      specs: 'Very good',
      year: 2010,
      price: 20020,
      categories: ['private'],
    } as unknown as CreateMobileDto;

    var consi = await service.create(mobile, user);
    expect(consi).toBeDefined();
  });
  it('should update an instance of mobile when prompted', async () => {
    var user = {
      id: 1,
      name: 'Omer',
      email: 'omer@gmail.com',
      password: '123',
      admin: 1,
    } as unknown as User;

    var mobile = {
      id: Math.floor(Math.random() * 99999),
      name: 'A50',
      brand: 'Samsung',
      specs: 'Very good',
      year: 2010,
      price: 20020,
      categories: ['private'],
    } as unknown as CreateMobileDto;
    await service.create(mobile, user);
    const consi = await service.update('A50', { price: 1000 });
    expect(consi).toBeDefined();
    expect(consi.price).toEqual(1000);
  });

  it('should remove a mobile when initiated', async () => {
    var user = {
      id: 1,
      name: 'Omer',
      email: 'omer@gmail.com',
      password: '123',
      admin: 1,
    } as unknown as User;

    var mobile = {
      id: Math.floor(Math.random() * 99999),
      name: 'A50',
      brand: 'Samsung',
      specs: 'Very good',
      year: 2010,
      price: 20020,
      categories: ['private'],
    } as unknown as CreateMobileDto;
    await service.create(mobile, user);
    var to_remove = 'A50';
    var removed = await service.remove(to_remove);
    expect(removed.name).toEqual(to_remove);
    expect(await service.findOne('A50')).toEqual(null);
  });
});
