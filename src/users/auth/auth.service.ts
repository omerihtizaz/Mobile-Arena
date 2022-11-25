import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { AdminService } from 'src/admin/admin.service';
// import { AdminService } from '.../';
const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private adminService: AdminService,
  ) {}
  async signup(name: string, email: string, password: string, admin: number) {
    var user = await this.userService.find(email);
    if (user.length) {
      throw new BadRequestException('Email already exist');
    }
    var blacklisted = await this.adminService.findOne(email);
    if (blacklisted) {
      throw new BadRequestException('Please contact customer service!');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const password_ = salt + '.' + hash.toString('hex');
    return { name, email, password_, admin };
  }
  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    const blacklisted = await this.adminService.findOne(email);

    if (!user) {
      throw new NotFoundException(
        'Email or Password incorrect. Please try again',
      );
    }
    if (blacklisted) {
      throw new BadRequestException('Please contact customer support!');
    }

    const [salt, storedhash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedhash === hash.toString('hex')) {
      return user;
    } else {
      throw new NotFoundException(
        'Email or Password incorrect. Please try again',
      );
    }
  }
}
