import {
  Param,
  Get,
  Body,
  Controller,
  Post,
  Session,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
  @ApiBody({ type: CreateAdminDto })
  @ApiAcceptedResponse({ description: 'Create Admin Portal' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Creation' })
  async signUp(@Body() body: CreateAdminDto, @Session() session: any) {
    if (body.admin == 0) {
      throw new BadRequestException('You cannot sign up as a User here!');
    }
    var admin = await this.authService.signup(
      body.name,
      body.email,
      body.password,
      body.admin,
    );
    var to_returned = await this.userService.create(
      admin.name,
      admin.email,
      admin.password_,
      admin.admin,
    );
    return to_returned;
  }

  @Post('/signin')
  @ApiBody({ type: SigninAdminDto })
  @ApiAcceptedResponse({ description: 'Admin Sign In' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  async signinUser(@Body() body: SigninAdminDto, @Session() session: any) {
    var user = await this.authService.signin(body.email, body.password);
    if (user.admin == 0) {
      throw new BadRequestException('You cannot sign in as User');
    }
    session.userID = user.id;
    return user;
  }

  @Get('/blacklist/:email')
  @ApiAcceptedResponse({ description: 'BlackList a User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  async blaclistUser(@Param('email') email: string, @Session() session: any) {
    const user = await this.userService.findOne(session.userID);
    console.log('USER; ', user);
    if (!user || user.admin == 0 || user.id != session.userID) {
      return null;
    }
    return await this.adminService.blaclistUser(email);
  }

  @Get('/findOne/:email')
  @ApiAcceptedResponse({ description: 'Find a Blacklisted User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden' })
  async findOne(@Param('email') email: string, @Session() session: any) {
    return await this.adminService.findOne(email);
  }
  @Get('/whitelist/:email')
  @ApiAcceptedResponse({ description: 'Whitelist a user' })
  @ApiUnauthorizedResponse({ description: 'Forbidden' })
  async whitelist(@Param('email') email: string, @Session() session: any) {
    const user = await this.userService.findOne(session.userID);
    if (!user || user.admin == 0 || user.id != session.userID) {
      return null;
    }
    return await this.adminService.whitelistUser(email);
  }
}
