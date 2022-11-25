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
import { AuthService } from '../users/auth/auth.service';
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

  @Post('/v1.0/signup')
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: "User's Sign Up Portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signup' })

  // this function will create an user
  // if the person tries to sign up as an admin, it will throw an error
  // it will then use authentication user to check if the user fulfills all the necessary requirements to sign up
  // if it does, it will create the user, or throw a necessary error
  async createUser(@Body() body: CreateUserDto) {
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
  @Post('/v1.0/signin')
  @ApiOkResponse({ description: "User's Sign In portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @ApiBody({ type: SignInUserDto })
  // this will take a dto as input,
  // and use the authentication system to check for the necessary authentication requirements.
  // if the user fulfilles, it will sign it up and initialise the session
  async signinUser(@Body() body: SignInUserDto, @Session() session) {
    var user = await this.authService.signin(body.email, body.password);
    session.userID = user.id;
    return user;
  }
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Find One User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @Get('/v1.0/findone/:id')
  // this will return a user by their id
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(id);
  }

  @Get('/v1.0/whoami')
  @ApiOkResponse({ description: 'Find One User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  // this will tell who the currently logged in user is.
  async WhoAmI(@Session() session) {
    return this.userService.findOne(session.userID);
  }
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "User's Sign Out portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signout' })
  @Get('/v1.0/logout')
  // this will logout the user
  async logout(@Session() session) {
    if (!session.userID) {
      throw new BadRequestException('You must log in first!');
    }
    session.userID = null;
    return Promise.resolve('Logged Out Successfully');
  }
  @UseGuards(AuthGuard)
  @Get('/v1.0/find/:email')
  @ApiOkResponse({ description: 'Get Users based on email' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  // this will find a user
  async find(@Param('email') email: string) {
    return await this.userService.find(email);
  }
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Remove Users' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @Get('/v1.0/remove/:id')
  // this will remove the user.
  async remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
