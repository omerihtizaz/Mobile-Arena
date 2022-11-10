import {
  Param,
  Get,
  Body,
  Controller,
  Post,
  Session,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/signup-user.dto';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { SignInUserDto } from './dtos/signin-user.dto';
import { AuthGuard } from '../guards/auth-guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    if (body.admin == 1) {
      throw new BadRequestException('You cannot sign up as Admin!');
    }
    var { name, email, password_, admin } = await this.authService.signup(
      body.name,
      body.email,
      body.password,
      body.admin,
    );
    return await this.userService.create(name, email, password_, admin);
  }
  @Post('/signin')
  async signinUser(@Body() body: SignInUserDto, @Session() session: any) {
    var user = await this.authService.signin(body.email, body.password);
    session.userID = user.id;
    return user;
  }
  @Get('/findone/:id')
  async findOne(@Param('id') id: number, @Session() session: any) {
    return await this.userService.findOne(id);
  }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  async WhoAmI(@Session() session: any) {
    console.log('I am in controller ka WHOAMI and id: ', session.userID);
    return this.userService.findOne(session.userID);
  }
  @UseGuards(AuthGuard)
  @Post('/logout')
  async logout(@Session() session: any) {
    if (!session.userID) {
      throw new BadRequestException('You must log in first!');
    }
    session.userID = null;
    return Promise.resolve('Logged Out Successfully');
  }
  @UseGuards(AuthGuard)
  @Get('/find/:email')
  async find(@Param('email') email: string) {
    return await this.userService.find(email);
  }
  // @UseGuards(AuthGuard)
  // @Get('/remove/:id')
  // async remove(@Param('id') id: number) {
  //   return this.userService.remove(id);
  // }
}
