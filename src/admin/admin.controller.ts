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
} from '@nestjs/common';
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
  async createAdmin(@Body() body: CreateAdminDto) {
    console.log('Creating the user...');
    if (body.admin == 0) {
      throw new Error('You cannot signup as non-admin here!');
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
  async signinUser(@Body() body: SigninAdminDto, @Session() session: any) {
    console.log('Checking the signin user!');
    var user = await this.authService.signin(body.email, body.password);
    if (user.admin == 0) {
      throw new Error('You cannot sign in as a non-admin here!');
    }
    session.userID = user.id;
    return user;
  }

  @Get('/blacklist/:email')
  async blaclistUser(@Param('email') email: string, @Session() session: any) {
    const user = await this.userService.findOne(session.userID);
    console.log(user);
    if (!user || user.admin == 0 || user.id != session.userID) {
      throw new Error('Forbidden Resource');
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
    console.log(user);
    if (!user || user.admin == 0 || user.id != session.userID) {
      throw new Error('Forbidden Resource');
    }
    return await this.adminService.whitelistUser(email);
  }
}
