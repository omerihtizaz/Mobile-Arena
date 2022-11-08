import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Equal, EqualOperator, FindOperator } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/signup-user.dto';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let fakeAuthService: Partial<AuthService>;
  let fakeRepo;
  let database = [];

  beforeEach(async () => {
    fakeRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: (id: number) => {
        const filteredcategories = database.filter(
          (user: User) => user.id == id['id'],
        );
        if (!filteredcategories[0]) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve(filteredcategories[0]);
      },
      find: (email: EqualOperator<string>) => {
        const filteredcategories = database.filter(
          (user) => Equal(user.email) === email,
        );
        return Promise.resolve(filteredcategories);
      },
      remove: (user: User) => {
        // console.log('User: ', user);
        const filteredcategories = database.filter((curr_user) => {
          curr_user.id != user.id;
          // console.log(curr_user.id, user.id);
        });
        console.log('before: ', database);
        database = filteredcategories;
        console.log('after: ', database);
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
        database.push(dto);
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
          id: Math.floor(Math.random() * 99999),
          name: name,
          email: email,
          password: password,
          admin: admin,
        } as unknown as User);
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
    const module: TestingModule = await Test.createTestingModule({
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
          useValue: fakeRepo,
        },
      ],
      controllers: [UsersController],
    }).compile();

    service = (await module).get(UsersService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be able to create an instance of user when prompted', async () => {
    var consi = await service.create('Omer', 'omer12@gmail.com', '123', 1);
    expect(consi).toBeDefined();
    expect(consi.name).toEqual('Omer');
    expect(consi.email).toEqual('omer12@gmail.com');
    expect(await service.find('omer12@gmail.com')).toBeDefined();
  });
  it('should be able to remove an instance of user when prompted', async () => {
    console.log(
      '--------------------------------------------------------------------------',
    );
    var consi = await service.create('Omer', 'omer.@gmail.com', '123', 1);
    var user = await service.findOne(consi.id);
    expect(user).toBeDefined();
    user = await service.remove(user.id);
    expect(user).toBeDefined();
    await expect(service.findOne(user.id)).toEqual(
      undefined || null || Promise.resolve({}),
    );
  });
});
