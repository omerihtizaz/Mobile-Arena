import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { CreateCategoryService } from './dtos/create-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;
  let database: Category[] = [];
  var fakeRepo;
  beforeEach(async () => {
    fakeRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: async (id: any) => {
        const filteredcategories = database.filter(
          async (categories) =>
            (await Promise.resolve(categories)).id === id.id.value,
        );

        return await Promise.resolve(filteredcategories[0]);
      },
      find: async (name: any) => {
        const filteredcategories = database.filter(
          async (categories) =>
            (await Promise.resolve(categories)).name === name.where.name.value,
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
    const moduleService: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: fakeRepo,
        },
      ],
    }).compile();
    database = [];
    service = moduleService.get<CategoriesService>(CategoriesService);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
  it('should create a category when prompted', async () => {
    const category = await controller.create({
      name: 'private',
    } as unknown as CreateCategoryService);
    expect(category).toBeDefined();
    const createdCat = await service.find('private');
    expect(createdCat[0]).toBeDefined();
    expect(createdCat[0].name).toEqual('private');
  });
  it('should remove a category when prompted', async () => {
    const category = await controller.create({
      name: 'private',
    } as unknown as CreateCategoryService);
    expect(category).toBeDefined();
    const removed = await service.remove(category.id);
    expect(removed).toBeDefined();
    expect(service.find('private')).toEqual(
      null || undefined || Promise.resolve({}),
    );
  });
});
