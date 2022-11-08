import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AdminService } from '../admin/admin.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
describe('AUTH SERVICE', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];

    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (
        name: string,
        email: string,
        password: string,
        admin: number,
      ) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          name: name,
          email: email,
          password: password,
          admin: admin,
        } as unknown as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const fakeAdminService = {
      findOne: () => Promise.resolve(),
    };
    const module = Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AdminService,
          useValue: fakeAdminService,
        },
      ],
    }).compile();
    service = (await module).get(AuthService);
  });
  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('can create a new user with a salted and hashed password', async () => {
    const user = await service.signup('Omer', 'omer@gmail.com', '123', 0);
    expect(user.password).not.toEqual('123');

    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it('throws an error if the user wishes to signup with an email that already exisit', async () => {
    await service.signup('a', 'asdf@asdf.com', 'asdf', 0);
    await expect(
      service.signup('a', 'asdf@asdf.com', 'asdf', 0),
    ).rejects.toThrow(BadRequestException);
  });
  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    fakeUserService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'asdf@asdf.com',
          password: 'laskdjf',
          admin: 0,
        } as unknown as User,
      ]);
    await expect(
      service.signin('laskdjf@alskdfj.com', 'passowrd'),
    ).rejects.toThrow(NotFoundException);
  });
});
