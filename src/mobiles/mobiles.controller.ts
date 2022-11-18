import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateMobileDto } from './dtos/create-mobile.dto';
import { MobilesService } from './mobiles.service';
import { AuthGuard } from '../guards/auth-guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { MobileDto } from './dtos/mobile.dto';
import { UsersService } from '../users/users.service';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
@Serialize(MobileDto)
@Controller('mobiles')
export class MobilesController {
  constructor(
    private mobileService: MobilesService,
    private userService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  @ApiAcceptedResponse({ description: 'Create Mobile Portal' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Creation' })
  @ApiBody({ type: CreateMobileDto })
  async create(@Body() body: CreateMobileDto, @Session() session) {
    var user = await this.userService.findOne(session.userID);
    return this.mobileService.create(body, user);
  }

  @Get('/getCategoryMobiles/:name')
  @ApiAcceptedResponse({ description: 'Get Mobiles of a single Category' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  async getCategoryMobiles(@Param('name') name: String, @Session() session) {
    var id = 0;
    if (name === 'public') {
      id = 2;
    } else if (name === 'private') {
      id = 1;
    } else {
      throw new BadRequestException("This category of mobiles doesn't exist");
    }
    if (id == 1 && !session.userID) {
      throw new BadRequestException('Forbidden Resource');
    }
    return await this.mobileService.getCategoryMobiles(id);
  }
  @UseGuards(AuthGuard)
  @ApiAcceptedResponse({ description: "Get the logged in user's mobiles" })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  @Get('/myMobiles')
  async getMyMobiles(@Session() session: any) {
    return await this.mobileService.getMyMobiles(session.userID);
  }
  @UseGuards(AuthGuard)
  @ApiAcceptedResponse({ description: 'Delete Mobile Portal' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  @Patch('/deleteMobile/:name')
  async deleteMobile(@Param('name') name: string, @Session() session) {
    return await this.mobileService.deleteMobile(name, session.userID);
  }
}
