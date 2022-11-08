import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MobilesModule } from './mobiles/mobiles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Mobile } from './mobiles/mobile.entity';
import { Category } from './categories/category.entity';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { BlackList } from './admin/blacklist.entity';

@Module({
  imports: [
    UsersModule,
    MobilesModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Mobile, Category, BlackList],
      synchronize: true,
    }),
    CategoriesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
