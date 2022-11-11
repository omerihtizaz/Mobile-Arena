import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../src/users/users.module';
import { MobilesModule } from '../src/mobiles/mobiles.module';
import { User } from '../src/users/user.entity';
import { Mobile } from '../src/mobiles/mobile.entity';
import { Category } from '../src/categories/category.entity';
import { BlackList } from '../src/admin/blacklist.entity';
import { CategoriesModule } from '../src/categories/categories.module';
import { AdminModule } from '../src/admin/admin.module';
import { Equal, Repository } from 'typeorm';
describe('Authentication System (e2e)', () => {
  let userRepo: Repository<User>;
  let app: INestApplication;
  let username;
  let user;
  beforeEach(async () => {
    let value = Math.floor(Math.random() * 99999);
    username = Math.floor(Math.random() * value);
    user = {
      name: username.toString(),
      email: username.toString() + '@confiz.com',
      password: username.toString(),
      admin: 0,
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        MobilesModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'test.sqlite',
          dropSchema: true,
          entities: [User, Mobile, Category, BlackList],
          synchronize: true,
          logging: false,
        }),
        CategoriesModule,
        AdminModule,
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepo = moduleFixture.get('UserRepository');
    // await userRepo.save(
    //   await userRepo.create({
    //     name: 'Admin',
    //     email: 'admin@confiz.com',
    //     password: 'password',
    //     admin: 1,
    //   }),
    // );
    await app.init();
  });
  afterEach(async () => {
    app.close();
  });
  it('it should be able to sign up', async () => {
    const returned = await request(app.getHttpServer())
      .post('/users/signup')
      .send(user)
      .expect(201);
    expect(returned.body.name).toEqual(user.name);
    expect(returned.body.email).toEqual(user.email);
  });
  it('should throw an error if email already exsit', async () => {
    let returned = await request(app.getHttpServer())
      .post('/users/signup')
      .send(user)
      .expect(201);
    returned = await request(app.getHttpServer())
      .post('/users/signup')
      .send(user)
      .expect(400);
  });

  it('should be able to signin if email exists', async () => {
    let returned = await request(app.getHttpServer())
      .post('/users/signup')
      .send(user)
      .expect(201);

    let loggedInUser = await request(app.getHttpServer())
      .post('/users/signin')
      .send({ email: user.email, password: user.password })
      .set({ field: 'Session', userID: 1 })
      .expect(201);

    expect(returned.body.name).toEqual(loggedInUser.body.name);
    expect(returned.body.email).toEqual(loggedInUser.body.email);
  });
  it('should throw an error if an admin tries to sign up in a user portal', async () => {
    user.admin = 1;
    await request(app.getHttpServer())
      .post('/users/signup')
      .send(user)
      .expect(400);
  });

  // // /                   DOES NOT WORK
  // it('should be able to tell who the logged in user is', async () => {
  //   let returned = await request(app.getHttpServer())
  //     .post('/users/signup')
  //     .send(user)
  //     .expect(201);
  //   let loggedInUser = await request(app.getHttpServer())
  //     .post('/users/signin')
  //     .send({ email: user.email, password: user.password })
  //     .expect(201);

  //   let whoami = await request(app.getHttpServer())
  //     .get('/users/whoami')
  //     .expect(201);

  //   expect(whoami).toEqual(returned);
  // });

  it('should be able to add a category', async () => {
    let category = await request(app.getHttpServer())
      .post('/categories/create')
      .send({ name: 'private' })
      .expect(201);

    expect(category.body.name).toEqual('private');

    category = await request(app.getHttpServer())
      .post('/categories/create')
      .send({ name: 'public' })
      .expect(201);

    expect(category.body.name).toEqual('public');
  });
  it('should be able to remove a category', async () => {
    let category = await request(app.getHttpServer())
      .get('/categories/remove/private')
      .expect(200);

    category = await request(app.getHttpServer())
      .get('/categories/remove/public')
      .expect(200);
  });
});
