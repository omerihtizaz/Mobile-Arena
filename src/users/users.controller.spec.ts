import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AdminService } from '../admin/admin.service';
import { BlackList } from '../admin/blacklist.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { Equal, EqualOperator } from 'typeorm';
import { CreateUserDto } from './dtos/signup-user.dto';
import { BadRequestException } from '@nestjs/common';
import { SignInUserDto } from './dtos/signin-user.dto';
describe('UsersController', () => {
  let controller: UsersController;
  let adminService: AdminService;
  var blacklistRepo;
  let blacklistDatabase: BlackList[] = [];
  let userService: UsersService;
  let fakeAuthService: Partial<AuthService>;
  let fakeUserRepo;
  let userDatabase = [];
  beforeEach(async () => {
    fakeUserRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: (id: any) => {
        const filteredcategories = userDatabase.filter(
          (user: User) => user.id == id.id,
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
          name: name,
          email: email,
          password_: password,
          admin: admin,
        });
      },
      signin: (email: string, password: string) => {
        const filteredcategories = userDatabase.filter(
          (user: User) => user.email === email && user.password === password,
        );
        if (!filteredcategories[0]) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve(filteredcategories[0]);
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

    blacklistRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: async (email: any) => {
        const filteredcategories = blacklistDatabase.filter(
          async (blacklist) =>
            (await Promise.resolve(blacklist)).email === email.email.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      remove: async (cat: BlackList) => {
        var index = await blacklistDatabase.indexOf(cat);
        if (index > -1) {
          blacklistDatabase.splice(index, 1);
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
        await blacklistDatabase.push(to_save);
        return Promise.resolve(to_save);
      },
    };
    const adminModule: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(BlackList),
          useValue: blacklistRepo,
        },
      ],
    }).compile();

    adminService = adminModule.get<AdminService>(AdminService);
    blacklistDatabase = [];
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: AdminService, useValue: fakeAdminService },
        { provide: UsersService, useValue: userService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
    expect(userService).toBeDefined();
    expect(controller).toBeDefined();
  });
  it('should be able to create a user when promped', async () => {
    const user = await controller.createUser(
      {
        name: 'Omer',
        email: 'omer@gmail.com',
        password: 'password',
        admin: 0,
      } as unknown as CreateUserDto,
      { userID: -1 },
    );
    expect(user).toBeDefined();
  });
  it('should throw an error when an admin tries to sign up', async () => {
    await expect(
      controller.createUser(
        {
          name: 'Omer',
          email: 'omer@gmail.com',
          password: 'password',
          admin: 1,
        } as unknown as CreateUserDto,
        { userID: -1 },
      ),
    ).rejects.toThrow(new BadRequestException('You cannot sign up as Admin!'));
  });
  it('it should be able to signin a user if the correct credentials are provided', async () => {
    const user = await controller.createUser(
      {
        name: 'Omer',
        email: 'omer@gmail.com',
        password: 'password',
        admin: 0,
      } as unknown as CreateUserDto,
      { userID: -1 },
    );
    expect(user).toBeDefined();

    await expect(
      controller.signinUser(
        {
          email: 'omer@gmail.com',
          password: 'password',
        } as unknown as SignInUserDto,
        { userID: -1 },
      ),
    ).toBeDefined();
  });
  it('it should be able to return the currently logged in user', async () => {
    const user = (await controller.createUser(
      {
        name: 'Omer',
        email: 'omer@gmail.com',
        password: 'password',
        admin: 0,
      } as unknown as CreateUserDto,
      { userID: 0 },
    )) as User;
    var whoami = await controller.WhoAmI({ userID: user.id });
    expect(whoami).toBeDefined();
    await expect(whoami).toEqual(user);
  });
  it('should be able to log out a user', async () => {
    var user = (await controller.createUser(
      {
        name: 'Omer',
        email: 'omer@gmail.com',
        password: 'password',
        admin: 0,
      } as unknown as CreateUserDto,
      { userID: 0 },
    )) as User;
    expect(user).toBeDefined();
    user = await controller.signinUser(
      {
        email: 'omer@gmail.com',
        password: 'password',
      } as unknown as SignInUserDto,
      { userID: 0 },
    );
    expect(user).toBeDefined();
    await expect(controller.logout({ userID: user.id })).toEqual(
      Promise.resolve('Logged Out Successfully'),
    );
  });
  it('should throw an error if a user tries to logout if it is not currently logged in', async () => {
    await expect(controller.logout({ userID: null })).rejects.toThrowError(
      new BadRequestException('You must log in first!'),
    );
  });
});
