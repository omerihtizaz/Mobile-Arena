import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
// import { UsersService } from '../users/users.service';
import { CreateMobileDto } from './dtos/create-mobile.dto';
import { MobilesService } from './mobiles.service';
import { AuthGuard } from '../guards/auth-guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { MobileDto } from './dtos/mobile.dto';
import { UsersService } from '../users/users.service';
@Serialize(MobileDto)
@Controller('mobiles')
export class MobilesController {
  constructor(
    private mobileService: MobilesService,
    private userService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  async create(@Body() body: CreateMobileDto, @Session() session: any) {
    var user = await this.userService.findOne(session.userID);
    return this.mobileService.create(body, user);
  }
  @Get('/getCategoryMobiles/:name')
  async getCategoryMobiles(
    @Param('name') name: String,
    @Session() session: any,
  ) {
    var id = 0;
    if (name === 'public') {
      id = 2;
    } else if (name === 'private') {
      id = 1;
    } else {
      return new Error("This category of mobiles doesn't exist");
    }
    if (id == 1 && !session.userID) {
      return new Error('Forbidden Resource');
    }
    return await this.mobileService.getCategoryMobiles(id);
  }
  @UseGuards(AuthGuard)
  @Get('/myMobiles')
  async getMyMobiles(@Session() session: any) {
    return await this.mobileService.getMyMobiles(session.userID);
  }
  @UseGuards(AuthGuard)
  @Patch('/deleteMobile/:name')
  async deleteMobile(@Param('name') name: string, @Session() session: any) {
    return await this.mobileService.deleteMobile(name, session.userID);
  }
}
