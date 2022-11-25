import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { Mobile } from './entity/mobile.entity';
import { MobilesController } from './mobiles.controller';
import { MobilesService } from './mobiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mobile]), CategoriesModule, UsersModule],
  controllers: [MobilesController],
  providers: [MobilesService],
})
export class MobilesModule {}
