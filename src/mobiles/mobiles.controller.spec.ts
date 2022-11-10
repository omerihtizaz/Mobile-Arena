import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from '../admin/admin.service';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/category.entity';
import { AuthService } from '../users/auth.service';
import { User } from '../users/user.entity';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { Equal, EqualOperator, SelectQueryBuilder } from 'typeorm';
import { MobilesController } from './mobiles.controller';
import { MobilesService } from './mobiles.service';
import { Mobile } from './mobile.entity';
import { CreateMobileDto } from './dtos/create-mobile.dto';

describe('MobilesController', () => {
  let controller: MobilesController;
  let Catservice: CategoriesService;
  let Catdatabase: Category[] = [];
  var CatRepo;
  let userService: UsersService;
  let fakeAuthService: Partial<AuthService>;
  let UserRepo;
  let userDatabase = [];
  let mobileRepo;
  let mobiledatabase = [];
  let mobileService;
  let bridgeTable = [];
  let allMobiles = [];
  let filteredcategories1 = [];
  beforeEach(async () => {
    mobileRepo = {
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(allMobiles),
      })),
      findOne: async (name: any) => {
        const filteredcategories = mobiledatabase.filter(
          async (category) =>
            (await Promise.resolve(category)).name === name.name.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      findOneBy: async (name: any) => {
        const filteredcategories = mobiledatabase.filter(
          async (category) =>
            (await Promise.resolve(category)).name === name.where.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      find: async (name: String) => {
        const filteredcategories = mobiledatabase.filter(
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
          category: dto.category,
          isPrivate: dto.isPrivate,
          categories: dto.categories,
          userEmail: dto.userEmail,
        } as unknown as Mobile;
        return Promise.resolve(mobile);
      },
      remove: async (to_remove: Mobile) => {
        const filteredcategories = mobiledatabase.filter(
          (mobiles) => mobiles.name == to_remove.name,
        );
        mobiledatabase = filteredcategories;
        var index = await bridgeTable.indexOf([
          to_remove.user.id,
          (await Promise.resolve(to_remove)).name,
        ]);
        if (index > -1) {
          bridgeTable.splice(index, 1);
        }
        return Promise.resolve(to_remove);
      },
      save: async (dto: Mobile) => {
        bridgeTable.push([dto.user.id, (await Promise.resolve(dto)).name]);
        mobiledatabase.push(await Promise.resolve(dto));
        return Promise.resolve(dto);
      },
    };
    CatRepo = {
      findOneBy: async (id: any) => {
        if (!id) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve({
          id: 1,
          name: 'private',
        } as unknown as Category);
      },
      find: async (id: any) => {
        if (!id) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve({
          id: 1,
          name: 'private',
        } as unknown as Category);
      },
      remove: async (cat: Category) => {
        var index = await Catdatabase.indexOf(cat);
        if (index > -1) {
          Catdatabase.splice(index, 1);
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
        Catdatabase.push(dto);
        return Promise.resolve(dto);
      },
    };

    UserRepo = {
      // mock the repo `findOneOrFail`

      findOneBy: (id: number) => {
        if (!id) {
          return undefined;
        }
        return Promise.resolve({
          id: 1,
          email: 'omer@gmail.com',
          password: 'password',
          admin: 0,
        } as unknown as User);
      },
      find: (email: EqualOperator<string>) => {
        if (!email) {
          return undefined;
        }
        return Promise.resolve({
          id: 1,
          email: 'omer@gmail.com',
          password: 'password',
          admin: 0,
        } as unknown as User);
      },
      remove: (user: User) => {
        const filteredcategories = userDatabase.filter((curr_user) => {
          curr_user.id != user.id;
        });
        userDatabase = filteredcategories;
        return Promise.resolve(user);
      },
      create: (someDto: any) => {
        var user = {
          id: Math.floor(Math.random() * 99999),
          name: someDto.name,
          email: someDto.email,
          password: someDto.password,
          admin: someDto.admin,
        } as unknown as User;

        return Promise.resolve(user);
      },
      save: (dto: User) => {
        userDatabase.push(dto);
        return Promise.resolve(dto);
      },
    };
    const fakeAdminService = {
      findOne: () => Promise.resolve(),
    };
    fakeAuthService = {
      signup: (
        name: string,
        email: string,
        password: string,
        admin: number,
      ) => {
        return Promise.resolve({
          // id: Math.floor(Math.random() * 99999),
          name: name,
          email: email,
          password_: password,
          admin: admin,
        });
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email: email,
          password: password,
          admin: 0,
        } as unknown as User);
      },
    };
    const userModule: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: AdminService,
          useValue: fakeAdminService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: UserRepo,
        },
      ],
    }).compile();

    userService = (await userModule).get(UsersService);

    const CatModule: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: CatRepo,
        },
      ],
    }).compile();
    Catdatabase = [];
    Catservice = CatModule.get<CategoriesService>(CategoriesService);
    const mobileModule: TestingModule = await Test.createTestingModule({
      providers: [
        MobilesService,
        {
          provide: CategoriesService,
          useValue: Catservice,
        },
        {
          provide: UsersService,
          useValue: userService,
        },
        {
          provide: getRepositoryToken(Mobile),
          useValue: mobileRepo,
        },
      ],
    }).compile();
    mobiledatabase = [];
    mobileService = mobileModule.get<MobilesService>(MobilesService);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobilesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: Catservice,
        },
        { provide: UsersService, useValue: userService },
        {
          provide: MobilesService,
          useValue: mobileService,
        },
      ],
    }).compile();
    bridgeTable = [];
    controller = module.get<MobilesController>(MobilesController);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(Catservice).toBeDefined();
    expect(controller).toBeDefined();
  });
  it('should be able to create a mobile when given right credentials', async () => {
    var cat = { id: 1, name: 'private' } as unknown as Category;
    Catdatabase.push(cat);
    var user = {
      id: 1,
      email: 'omer@gmail.com',
      password: 'password',
      admin: 0,
    } as unknown as User;
    userDatabase.push(user);
    var mobile = {
      name: 'A50',
      brand: 'Samsung',
      specs: 'very good mobile',
      year: 2012,
      price: 1000,
      category: 1,
      isPrivate: 1,
      categories: ['private'],
      userEmail: 'omer@gmail.com',
    } as unknown as CreateMobileDto;
    var createdMobile = await controller.create(mobile, { userID: 1 });
    expect(createdMobile).toBeDefined();
    expect(createdMobile.brand).toEqual('Samsung');
  });

  it("should be able to get the user's mobiles", async () => {
    var cat = { id: 1, name: 'private' } as unknown as Category;
    Catdatabase.push(cat);
    var user = {
      id: 1,
      email: 'omer@gmail.com',
      password: 'password',
      admin: 0,
    } as unknown as User;
    userDatabase.push(user);
    var mobile = {
      name: 'A50',
      brand: 'Samsung',
      specs: 'very good mobile',
      year: 2012,
      price: 1000,
      category: 1,
      isPrivate: 1,
      categories: ['private'],
      userEmail: 'omer@gmail.com',
    } as unknown as CreateMobileDto;
    var createdMobile = await controller.create(mobile, { userID: 1 });
    var mobile = {
      name: 'A51',
      brand: 'Samsung',
      specs: 'very good mobile',
      year: 2013,
      price: 1020,
      category: 2,
      isPrivate: 0,
      categories: ['public'],
      userEmail: 'omer@gmail.com',
    } as unknown as CreateMobileDto;
    var createdMobile2 = await controller.create(mobile, { userID: 1 });
    expect(createdMobile).toBeDefined();
    expect(createdMobile2).toBeDefined();
    var myMobiles = await mobileService.getMyMobiles(1);
    filteredcategories1 = bridgeTable.filter((r) => r[0] === 1);
    //
    for (var val in filteredcategories1) {
      allMobiles.push(
        await mobiledatabase.filter(
          (S) => S.name === filteredcategories1[val][1],
        ),
      );
    }
    expect(myMobiles[0][0]).toBe(createdMobile);
    expect(myMobiles[1][0]).toBe(createdMobile2);
  });

  it('should be able to remove a mobile when prompted', async () => {
    var cat = { id: 1, name: 'private' } as unknown as Category;
    Catdatabase.push(cat);
    var user = {
      id: 1,
      email: 'omer@gmail.com',
      password: 'password',
      admin: 0,
    } as unknown as User;
    userDatabase.push(user);
    var mobile = {
      name: 'A50',
      brand: 'Samsung',
      specs: 'very good mobile',
      year: 2012,
      price: 1000,
      category: 1,
      isPrivate: 1,
      categories: ['private'],
      userEmail: 'omer@gmail.com',
    } as unknown as CreateMobileDto;
    var createdMobile = await controller.create(mobile, { userID: 1 });
    expect(createdMobile).toBeDefined();
  });
});
