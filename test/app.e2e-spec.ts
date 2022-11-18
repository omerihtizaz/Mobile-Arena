import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../src/users/users.module';
import { MobilesModule } from '../src/mobiles/mobiles.module';
import { User } from '../src/users/user.entity';
import { Mobile } from '../src/mobiles/mobile.entity';
import { Category } from '../src/categories/category.entity';
import { BlackList } from '../src/admin/blacklist.entity';
import { CategoriesModule } from '../src/categories/categories.module';
import { AdminModule } from '../src/admin/admin.module';
const cookieSession = require('cookie-session');

describe('Integration tests ( e2e ) ', () => {
  let app: INestApplication;
  let username;
  let user;
  it('should be able to create an instance of app', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        MobilesModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Mobile, Category, BlackList],
          synchronize: true,
          logging: false,
        }),
        CategoriesModule,
        AdminModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(
      cookieSession({
        keys: ['asfjhasf'],
      }),
    );
    await app.init();
    expect(app).toBeDefined();
  });
  describe('Authentication and User e2e', () => {
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
            database: ':memory:',
            dropSchema: true,
            entities: [User, Mobile, Category, BlackList],
            synchronize: true,
            logging: false,
          }),
          CategoriesModule,
          AdminModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.use(
        cookieSession({
          keys: ['asfjhasf'],
        }),
      );
      await app.init();
    });
    afterEach(async () => {
      await app.close();
    });

    it('it should be able to sign up', async () => {
      const returned = await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);
      expect(returned.body.name).toEqual(user.name);
      expect(returned.body.email).toEqual(user.email);
    });
    it('should throw an error if email already exist', async () => {
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

    it('should be able to tell who the logged in user is', async () => {
      user.admin = 0;
      let returned = await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);
      let loggedInUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);

      let whoami = await request(app.getHttpServer())
        .get('/users/whoami')
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(200);
      expect(whoami.body.email).toEqual(returned.body.email);
    });
  });

  describe('Category e2e', () => {
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
            database: ':memory:',
            dropSchema: true,
            entities: [User, Mobile, Category, BlackList],
            synchronize: true,
            logging: false,
          }),
          CategoriesModule,
          AdminModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.use(
        cookieSession({
          keys: ['asfjhasf'],
        }),
      );
      await app.init();
    });
    afterEach(async () => {
      await app.close();
    });

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

  describe('Mobile e2e', () => {
    let mobile;
    let categories = [['private'], ['public'], ['private', 'public']];

    beforeEach(async () => {
      let value = Math.floor(Math.random() * 99999);
      username = Math.floor(Math.random() * value);
      user = {
        name: username.toString(),
        email: username.toString() + '@confiz.com',
        password: username.toString(),
        admin: 0,
      };
      mobile = {
        name: (Math.random() + 1).toString(36).substring(7),
        brand: (Math.random() + 1).toString(36).substring(7),
        specs: 'Very good',
        year: Math.floor(Math.random() * (2021 - 2012) + 2012),
        price: Math.floor(Math.random() * 9999 + 1),
        categories: categories[Math.floor(Math.random() * 2)],
      };
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          UsersModule,
          MobilesModule,
          TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [User, Mobile, Category, BlackList],
            synchronize: true,
            logging: false,
          }),
          CategoriesModule,
          AdminModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.use(
        cookieSession({
          keys: ['asfjhasf'],
        }),
      );
      await app.init();
    });
    afterEach(async () => {
      await app.close();
    });

    it('should throw an error message if a non-registered/signout user tries to add a mobile ', async () => {
      let response = await request(app.getHttpServer())
        .post('/mobiles/create')
        .send({
          name: 'Huawei',
          brand: 'Huawei',
          specs: 'Very excellent phone',
          year: 2016,
          price: 10340,
          categories: ['private'],
        })
        .expect(403);
    });

    it('should add a mobile if a logged user tries to add a mobile', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);
      const req = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
      await request(app.getHttpServer())
        .post('/mobiles/create')
        .set('Cookie', req.header['set-cookie'])
        .send({
          name: 'Huawei',
          brand: 'Huawei',
          specs: 'Very excellent phone',
          year: 2016,
          price: 1030,
          categories: ['private'],
        })
        .expect(201);
    });

    it('should throw an error if an unregistered user tries to create a mobile', async () => {
      await request(app.getHttpServer())
        .post('/mobiles/create')
        .send(mobile)
        .expect(403);
    });
    it('should create a mobile if the user is valid', async () => {
      await request(app.getHttpServer())
        .post('/categories/create')
        .send({ name: 'public' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/categories/create')
        .send({ name: 'private' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);
      let signinreq = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
      let added_mobile = await request(app.getHttpServer())
        .post('/mobiles/create')
        .send(mobile)
        .set('Cookie', signinreq.header['set-cookie'])
        .expect(201);

      for (let cat in mobile.categories) {
        expect(mobile.categories[cat]).toEqual(
          added_mobile.body.Category[cat].name,
        );
      }
      expect(added_mobile.body.name).toEqual(mobile.name);
      expect(added_mobile.body.brand).toEqual(mobile.brand);
    });
    it('should display public categories to an unregistered user', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);

      const loggedInUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
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
      mobile.categories = ['public'];
      await request(app.getHttpServer())
        .post('/mobiles/create')
        .send(mobile)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(201);

      let whoami = await request(app.getHttpServer())
        .get('/users/whoami')
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(200);
      expect(whoami.body.email).toEqual(user.email);
      await request(app.getHttpServer())
        .post('/users/logout')
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(201);
      await request(app.getHttpServer())
        .get('/mobiles/getCategoryMobiles/public')
        .expect(200);
    });

    it('should not display private categories to an unregistered user', async () => {
      let category = await request(app.getHttpServer())
        .post('/categories/create')
        .send({ name: 'private' })
        .expect(201);
      expect(category.body.name).toEqual('private');

      category = await request(app.getHttpServer())
        .post('/categories/create')
        .send({ name: 'public' })
        .expect(201);
      let l = await request(app.getHttpServer())
        .get('/mobiles/getCategoryMobiles/private')
        .expect(400);
    });
    it('should display private and public categories to an registered user', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);

      const loggedInUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
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
      mobile.categories = ['public', 'private'];
      await request(app.getHttpServer())
        .post('/mobiles/create')
        .send(mobile)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(201);

      let whoami = await request(app.getHttpServer())
        .get('/users/whoami')
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(200);
      expect(whoami.body.email).toEqual(user.email);
      await request(app.getHttpServer())
        .post('/users/logout')
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(201);
      await request(app.getHttpServer())
        .get('/mobiles/getCategoryMobiles/public')
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(200);
      await request(app.getHttpServer())
        .get('/mobiles/getCategoryMobiles/private')
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(200);
    });

    it('should not allow a unregistered user to access the delete portal', async () => {
      await request(app.getHttpServer())
        .patch('/mobiles/deleteMobile/asdadfs')
        .expect(403);
    });

    it('should not allow a user to delete a mobile which does not exist', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);

      const loggedInUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
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
      mobile.categories = ['public', 'private'];
      await request(app.getHttpServer())
        .post('/mobiles/create')
        .send(mobile)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(201);
      await request(app.getHttpServer())
        .patch(`/mobiles/deleteMobile/${mobile.name + 's'}`)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(400);
    });
    it('should not allow a user to delete a mobile which he didnot create', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);

      const loggedInUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
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
      mobile.categories = ['public', 'private'];
      await request(app.getHttpServer())
        .post('/mobiles/create')
        .send(mobile)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(201);

      let value = Math.floor(Math.random() * 99999);
      username = Math.floor(Math.random() * value);
      user = {
        name: username.toString(),
        email: username.toString() + '@confiz.com',
        password: username.toString(),
        admin: 0,
      };

      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);

      var secondUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
      await request(app.getHttpServer())
        .patch(`/mobiles/deleteMobile/${mobile.name}`)
        .set('Cookie', secondUser.header['set-cookie'])
        .expect(400);
    });

    it('should not allow a user to delete a mobile which does not exist', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);

      const loggedInUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
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
      mobile.categories = ['public', 'private'];
      await request(app.getHttpServer())
        .post('/mobiles/create')
        .send(mobile)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(201);
      await request(app.getHttpServer())
        .patch(`/mobiles/deleteMobile/${mobile.name}`)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect(200);
    });
  });

  describe('Admin e2e', () => {
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
            database: ':memory:',
            dropSchema: true,
            entities: [User, Mobile, Category, BlackList],
            synchronize: true,
            logging: false,
          }),
          CategoriesModule,
          AdminModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.use(
        cookieSession({
          keys: ['asfjhasf'],
        }),
      );
      await app.init();
    });
    afterEach(async () => {
      await app.close();
    });

    it('should be able to blacklist a user', async () => {
      user.admin = 1;
      await request(app.getHttpServer())
        .post('/admin/signup')
        .send(user)
        .expect(201);
      let signinreq = await request(app.getHttpServer())
        .post('/admin/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
      const req = `/admin/blacklist/${user.email}`;
      await request(app.getHttpServer())
        .get(req)
        .set('Cookie', signinreq.header['set-cookie'])
        .expect(200);
    });

    it('should be able to whitelist a user if blacklisted', async () => {
      user.admin = 1;
      await request(app.getHttpServer())
        .post('/admin/signup')
        .send(user)
        .expect(201);
      let signinreq = await request(app.getHttpServer())
        .post('/admin/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
      let req = `/admin/blacklist/${user.email}`;
      await request(app.getHttpServer())
        .get(req)
        .set('Cookie', signinreq.header['set-cookie'])
        .expect(200);
      req = `/admin/whitelist/${user.email}`;
      await request(app.getHttpServer())
        .get(req)
        .set('Cookie', signinreq.header['set-cookie'])
        .expect(200);
    });

    it('should be throw an error if tries to whitelist a user who is not blacklisted', async () => {
      user.admin = 1;
      await request(app.getHttpServer())
        .post('/admin/signup')
        .send(user)
        .expect(201);
      let signinreq = await request(app.getHttpServer())
        .post('/admin/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
      let req = `/admin/whitelist/${user.email}`;
      await request(app.getHttpServer())
        .get(req)
        .set('Cookie', signinreq.header['set-cookie'])
        .expect(400);
    });

    it('should be throw an error if an unregistered user tries to blacklist a user', async () => {
      let req = `/admin/whitelist/${user.email}`;
      await request(app.getHttpServer()).get(req).expect(403);
    });

    it('should be throw an error if a user tries to blacklist a user', async () => {
      await request(app.getHttpServer())
        .post('/users/signup')
        .send(user)
        .expect(201);
      const loggedInUser = await request(app.getHttpServer())
        .post('/users/signin')
        .send({ email: user.email, password: user.password })
        .expect(201);
      let req = `/admin/whitelist/${user.email}`;
      await request(app.getHttpServer())
        .get(req)
        .set('Cookie', loggedInUser.header['set-cookie'])
        .expect({});
    });
  });
});
