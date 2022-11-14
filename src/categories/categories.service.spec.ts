import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { EqualOperator } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { CreateCategoryService } from './dtos/create-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let database: Category[] = [];
  var fakeRepo;
  beforeEach(async () => {
    fakeRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: async (id: any) => {
        const filteredcategories = database.filter(
          async (blacklist) =>
            (await Promise.resolve(blacklist)).id === id.id.value,
        );

        return await Promise.resolve(filteredcategories[0]);
      },
      find: async (id: any) => {
        const filteredcategories = database.filter(
          async (blacklist) =>
            (await Promise.resolve(blacklist)).id === id.id.value,
        );
        return await Promise.resolve(filteredcategories);
      },
      remove: async (cat: Category) => {
        var index = await database.indexOf(cat);
        if (index > -1) {
          database.splice(index, 1);
        }
        return Promise.resolve(cat);
      },
      create: ({ name }: any) => {
        var category = {
          id: Math.floor(Math.random() * 99999),
          name: name,
        } as unknown as Category;
        return Promise.resolve(category);
      },
      save: (dto: Category) => {
        database.push(dto);
        return Promise.resolve(dto);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: fakeRepo,
        },
      ],
    }).compile();
    database = [];
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create a category when prompted', async () => {
    let va_ = new CreateCategoryService();
    va_.name = 'private';
    const category = service.create(va_);
    expect(category).toBeDefined();
    expect(service.find('private')).toBeDefined();
  });
  it('should remove a category when prompted', async () => {
    let va_ = new CreateCategoryService();
    va_.name = 'public';
    const to_remove_id = (await service.create(va_)).id;

    const removed = service.remove(to_remove_id);
    expect(removed).toBeDefined();
    expect((await removed).id).toEqual(to_remove_id);
    expect(service.find('private')).toEqual(
      null || undefined || Promise.resolve({}),
    );
  });
});
