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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
const cookieSession = require('cookie-session');
@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}
  @Post('/signup')
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: "User's Sign Up Portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signup' })
  async createUser(@Body() body: CreateUserDto, @Session() session) {
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
  @ApiOkResponse({ description: "User's Sign In portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @ApiBody({ type: SignInUserDto })
  async signinUser(@Body() body: SignInUserDto, @Session() session) {
    var user = await this.authService.signin(body.email, body.password);
    session.userID = user.id;
    console.log('Created User. Session ID: ', session);
    return user;
  }
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Find One User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @Get('/findone/:id')
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(id);
  }

  @Get('/whoami')
  @ApiOkResponse({ description: 'Find One User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  async WhoAmI(@Session() session) {
    return this.userService.findOne(session.userID);
  }
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "User's Sign Out portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signout' })
  @Post('/logout')
  async logout(@Session() session) {
    if (!session.userID) {
      throw new BadRequestException('You must log in first!');
    }
    session.userID = null;
    return Promise.resolve('Logged Out Successfully');
  }
  @UseGuards(AuthGuard)
  @Get('/find/:email')
  @ApiOkResponse({ description: 'Get Users based on email' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  async find(@Param('email') email: string) {
    return await this.userService.find(email);
  }
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Remove Users' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @Get('/remove/:id')
  async remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
