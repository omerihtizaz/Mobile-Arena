import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Equal, EqualOperator, FindOperator } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { AuthService } from './auth/auth.service';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
let userService: UsersService;
let fakeAuthService: Partial<AuthService>;
let fakeUserRepo;
let userDatabase = [];
describe('UsersService', () => {
  beforeEach(async () => {
    fakeUserRepo = {
      findOneBy: (id: number) => {
        const filteredcategories = userDatabase.filter(
          (user: User) => user.id == id['id'],
        );
        if (!filteredcategories[0]) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve(filteredcategories[0]);
      },
      find: (email: EqualOperator<string>) => {
        const filteredcategories = userDatabase.filter(
          (user) => Equal(user.email) === email,
        );
        return Promise.resolve(filteredcategories);
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
    const userServiceModule: TestingModule = await Test.createTestingModule({
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
          useValue: fakeUserRepo,
        },
      ],
      controllers: [UsersController],
    }).compile();

    userService = (await userServiceModule).get(UsersService);
  });
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
  it('should be able to create an instance of user when prompted', async () => {
    var consi = await userService.create('Omer', 'omer12@gmail.com', '123', 1);
    expect(consi).toBeDefined();
    expect(consi.name).toEqual('Omer');
    expect(consi.email).toEqual('omer12@gmail.com');
    expect(await userService.find('omer12@gmail.com')).toBeDefined();
  });
  it('should be able to remove an instance of user when prompted', async () => {
    var consi = await userService.create('Omer', 'omer.@gmail.com', '123', 1);
    var user = await userService.findOne(consi.id);
    expect(user).toBeDefined();
    user = await userService.remove(user.id);
    expect(user).toBeDefined();
    await expect(userService.findOne(user.id)).toEqual(
      undefined || null || Promise.resolve({}),
    );
  });
});
export { userService, fakeAuthService, fakeUserRepo, userDatabase };
