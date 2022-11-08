import {
  Param,
  Get,
  Body,
  Controller,
  Post,
  Session,
  UseGuards,
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
    console.log('Creating the user...');
    if (body.admin == 1) {
      return new Error('You cannot sign up as Admin!');
    }
    var user = await this.authService.signup(
      body.name,
      body.email,
      body.password,
      body.admin,
    );

    return user;
  }
  @Post('/signin')
  async signinUser(@Body() body: SignInUserDto, @Session() session: any) {
    console.log('Checking the signin user!');
    var user = await this.authService.signin(body.email, body.password);
    session.userID = user.id;
    return user;
  }
  @Get('/findone/:id')
  async findOne(@Param('id') id: number, @Session() session: any) {
    console.log('Param: ', id);
    return await this.userService.findOne(id);
  }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  async WhoAmI(@Session() session: any) {
    console.log(session.userID);
    return this.userService.findOne(session.userID);
  }
  @UseGuards(AuthGuard)
  @Post('/logout')
  async logout(@Session() session: any) {
    session.userID = null;
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
