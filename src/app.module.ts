import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MobilesModule } from './mobiles/mobiles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entity/user.entity';
import { BlackList } from './admin/entity/blacklist.entity';
import { Category } from './categories/entity/category.entity';
import { Mobile } from './mobiles/entity/mobile.entity';
const cookieSession = require('cookie-session');
const settings = require('../ormconfig.js');
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    UsersModule,
    MobilesModule,
    TypeOrmModule.forRoot(settings),
    CategoriesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    ConfigService,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          // keys: [this.configService.get('COOKIE_KEY')],
          keys: ['jahsfiasf'],
        }),
      )
      .forRoutes('*');
  }
}
