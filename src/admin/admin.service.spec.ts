import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EqualOperator } from 'typeorm';
import { AdminService } from './admin.service';
import { BlackList } from './blacklist.entity';

describe('AdminService', () => {
  let service: AdminService;
  var fakeRepo;
  let database: BlackList[] = [];
  beforeEach(async () => {
    fakeRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: async (email: any) => {
        const filteredcategories = database.filter(
          async (blacklist) =>
            (await Promise.resolve(blacklist)).email === email.email.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      remove: async (cat: BlackList) => {
        var index = await database.indexOf(cat);
        if (index > -1) {
          database.splice(index, 1);
        }
        return Promise.resolve(cat);
      },
      create: (obj: any) => {
        var blacklisted = {
          id: Math.floor(Math.random() * 99999),
          email: obj.email,
        } as unknown as BlackList;

        return Promise.resolve(blacklisted);
      },
      save: async (to_save: BlackList) => {
        await database.push(to_save);
        return Promise.resolve(to_save);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(BlackList),
          useValue: fakeRepo,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    database = [];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create a blacklisted user when prompted', async () => {
    const category = await service.blaclistUser('omer@gmail.com');
    expect(category).toBeDefined();
    expect(await service.findOne('omer@gmail.com')).toBeDefined();
  });
  it('should whitelist a user when prompted', async () => {
    await service.blaclistUser('o@gmail.com');
    const whitelistedUser = await service.whitelistUser('o@gmail.com');
    console.log(whitelistedUser);
    expect(whitelistedUser).toBeDefined();
    expect(whitelistedUser.email).toEqual('o@gmail.com');
    expect(service.findOne('o@gmail.com')).toEqual(
      undefined || null || Promise.resolve({}),
    );
  });
});
