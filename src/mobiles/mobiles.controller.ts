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
import { Categories } from '../Literals';
@Serialize(MobileDto)
@Controller('mobiles')
export class MobilesController {
  constructor(
    private mobileService: MobilesService,
    private userService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('/v1.0/create')
  @ApiAcceptedResponse({ description: 'Create Mobile Portal' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Creation' })
  @ApiBody({ type: CreateMobileDto })

  // create method takes in the argument of CreateMobileDto,
  //  which uses class validation to validate all the input fields
  // it will then check if there is a user logged in, and throws
  // an error in case there isnt
  // then it will create the instance of mobile.
  async create(@Body() body: CreateMobileDto, @Session() session) {
    var user = await this.userService.findOne(session.userID);
    if (!user) {
      throw new BadRequestException('You must be signed in first');
    }
    return this.mobileService.create(body, user);
  }

  @Get('/v1.0/getCategoryMobiles/:name')
  @ApiAcceptedResponse({ description: 'Get Mobiles of a single Category' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })

  // this function takes in a name of categories
  // if there is no user signed in, and requests to see private,
  // it will throw an error
  // else it will check the id of the name provided,
  // and call the service to get all the mobiles of that particular category
  async getCategoryMobiles(@Param('name') name: String, @Session() session) {
    console.log(name, Categories.PRIVATE);
    if (name != Categories.PRIVATE && name != Categories.PUBLIC) {
      throw new BadRequestException("This category of mobiles doesn't exist");
    }
    if (name == Categories.PRIVATE && !session.userID) {
      throw new BadRequestException('Forbidden Resource');
    }
    return await this.mobileService.getCategoryMobiles(name);
  }

  @UseGuards(AuthGuard)
  @ApiAcceptedResponse({ description: "Get the logged in user's mobiles" })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  @Get('/v1.0/getAllMobiles/:page')

  // this will get the mobiles of a user if they are first signed in
  async getAllMobiles(@Param('page') page: number, @Session() session: any) {
    var user = await this.userService.findOne(session.userID);
    if (!user) {
      throw new BadRequestException('You must be signed in first');
    }
    return await this.mobileService.getAllMobiles(page);
  }

  @UseGuards(AuthGuard)
  @ApiAcceptedResponse({ description: "Get the logged in user's mobiles" })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  @Get('/v1.0/myMobiles')

  // this will get the mobiles of a user if they are first signed in
  async getMyMobiles(@Session() session: any) {
    var user = await this.userService.findOne(session.userID);
    if (!user) {
      throw new BadRequestException('You must be signed in first');
    }
    return await this.mobileService.getMyMobiles(session.userID);
  }
  @UseGuards(AuthGuard)
  @ApiAcceptedResponse({ description: 'Delete Mobile Portal' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  @Patch('/v1.0/deleteMobile/:name')
  // this will delete a mobile, if the user is first signed in, and if the mobile exists
  async deleteMobile(@Param('name') name: string, @Session() session) {
    var user = await this.userService.findOne(session.userID);
    if (!user) {
      throw new BadRequestException('You must be signed in first');
    }
    return await this.mobileService.deleteMobile(name, session.userID);
  }
}
