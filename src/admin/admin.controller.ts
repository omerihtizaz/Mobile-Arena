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
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth-guard';
import { AuthService } from '../users/auth/auth.service';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { SigninAdminDto } from './dtos/signin-admin.dto';
@Controller('admin')
export class AdminController {
  // Has an
  //  instance of auth service as authentication system for signup and signin
  //  instance of admin service to communicate with the database
  //  instance of userservice to communicate with the user's repo
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private adminService: AdminService,
    private userService: UsersService,
  ) {}

  @Post('/v1.0/signup')
  @ApiBody({ type: CreateAdminDto })
  @ApiAcceptedResponse({ description: 'Create Admin Portal' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Creation' })
  async signUpAdmin(@Body() body: CreateAdminDto) {
    // if a user tries to sign up in the admin's portal, it will send back an error
    if (body.admin != 1) {
      throw new BadRequestException('You cannot sign up as a User here!');
    }

    // check the compatibility of admin for sign up.
    var admin = await this.authService.signup(
      body.name,
      body.email,
      body.password,
      body.admin,
    );
    // create an admin and return the instance of admin created
    var to_returned = await this.userService.create(
      admin.name,
      admin.email,
      admin.password_,
      admin.admin,
    );
    return to_returned;
  }

  @Post('/v1.0/signin')
  @ApiBody({ type: SigninAdminDto })
  @ApiAcceptedResponse({ description: 'Admin Sign In' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  // sign in admin takes in a dto, and session as a parameter,
  //  signs in the admin after authentication,
  //  and then allocates the session with the logged in Admin
  async signinAdmin(@Body() body: SigninAdminDto, @Session() session: any) {
    var user = await this.authService.signin(body.email, body.password);
    // if a user tries to sign up, throw an error
    if (user.admin == 0) {
      throw new BadRequestException('You cannot sign in as User');
    }
    session.userID = user.id;

    return user;
  }
  @UseGuards(AuthGuard)
  @ApiAcceptedResponse({ description: 'BlackList a User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  @Get('/v1.0/blacklist/:email')
  // blacklisting a user requires an email, and a session.
  // an admin must be signed up to complete this transaction.
  // it is an atomic transaction, in order for a user to be blacklisted,
  //  there must be an admin signed up and the user must exist in the database to be blacklisted
  async blaclistUser(@Param('email') email: string, @Session() session: any) {
    // check if there is a user logged in.
    const user = await this.userService.findOne(session.userID);
    // if user is not available, or the user logged in is not an admin, it will throw an error
    if (!user || user.admin == 0 || user.id != session.userID) {
      throw new BadRequestException(
        'You must be logged in as admin to complete this transaction',
      );
    }
    return await this.adminService.blaclistUser(email);
  }
  @UseGuards(AuthGuard)
  @Get('/v1.0/findOne/:email')
  // find one method returns the blacklisted user if it exists
  @ApiAcceptedResponse({ description: 'Find a Blacklisted User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden' })
  async findOne(@Param('email') email: string) {
    return await this.adminService.findOne(email);
  }
  @Get('/v1.0/whitelist/:email')
  @UseGuards(AuthGuard)
  @ApiAcceptedResponse({ description: 'Whitelist a user' })
  @ApiUnauthorizedResponse({ description: 'Forbidden' })
  // similar to blacklisting a user, whitelisting a user also requires an admin to be logged in.
  // and also a user to be blacklisted before it can be whitelisted.
  async whitelist(@Param('email') email: string, @Session() session: any) {
    const user = await this.userService.findOne(session.userID);
    if (user == null || user.admin == 0 || user.id != session.userID) {
      throw new BadRequestException(
        'You must be logged in as admin to complete this transaction',
      );
    }
    return await this.adminService.whitelistUser(email);
  }
}
