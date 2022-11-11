import {
  Param,
  Get,
  Body,
  Controller,
  Post,
  Session,
  UseGuards,
  ForbiddenException,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { User } from '../users/user.entity';
import { AuthService } from '../users/auth.service';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { SigninAdminDto } from './dtos/signin-admin.dto';
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private adminService: AdminService,
    private userService: UsersService,
  ) {}

  @Post('/signup')
  async signUp(@Body() body: CreateAdminDto, @Session() session: any) {
    if (body.admin == 0) {
      console.log('BROOO');
      throw new BadRequestException('You cannot sign up as a User here!');
    }
    console.log(body);
    var admin = await this.authService.signup(
      body.name,
      body.email,
      body.password,
      body.admin,
    );
    console.log('admin is this: ', admin);
    var to_returned = await this.userService.create(
      admin.name,
      admin.email,
      admin.password_,
      admin.admin,
    );
    console.log('to_returned: ', to_returned);
    return to_returned;
  }

  @Post('/signin')
  async signinUser(@Body() body: SigninAdminDto, @Session() session: any) {
    console.log('I AM IN ADMIN CONTROLLER: ', body);
    var user = await this.authService.signin(body.email, body.password);
    if (user.admin == 0) {
      throw new BadRequestException('You cannot sign in as User');
    }
    session.userID = user.id;
    return user;
  }

  @Get('/blacklist/:email')
  async blaclistUser(@Param('email') email: string, @Session() session: any) {
    const user = await this.userService.findOne(session.userID);
    if (!user || user.admin == 0 || user.id != session.userID) {
      return null;
    }
    return await this.adminService.blaclistUser(email);
  }

  @Get('/findOne/:email')
  async findOne(@Param('email') email: string, @Session() session: any) {
    return await this.adminService.findOne(email);
  }
  @Get('/whitelist/:email')
  async whitelist(@Param('email') email: string, @Session() session: any) {
    const user = await this.userService.findOne(session.userID);
    console.log('HERE IS USER: ', user);
    if (!user || user.admin == 0 || user.id != session.userID) {
      return null;
    }
    return await this.adminService.whitelistUser(email);
  }
}
