import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { BlackList } from './blacklist.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(BlackList) private repo: Repository<BlackList>,
  ) {}

  async blaclistUser(email: String) {
    const obj = this.repo.create({ email });
    return this.repo.save(obj);
  }
  async whitelistUser(email: String) {
    const obj = await this.findOne(email);
    if (!obj) {
      throw new BadRequestException('User not blacklisted');
    }
    return await this.repo.remove(obj);
  }
  async findOne(email: String) {
    if (!email) {
      return null;
    }
    var user = await this.repo.findOneBy({ email: Equal(email) });
    return user;
  }
}
