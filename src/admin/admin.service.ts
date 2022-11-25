import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { BlackList } from './entity/blacklist.entity';

@Injectable()
export class AdminService {
  // must have an instance of a repository of blacklist
  constructor(
    @InjectRepository(BlackList) private repo: Repository<BlackList>,
  ) {}

  // black listing a user first will find an email.
  // if an instance of that email already exist, it will throw an error
  // else, it will create and save the instance of the blacklisted user
  async blaclistUser(email: String) {
    const user = await this.findOne(email);
    if (user) {
      throw new BadRequestException('User Already exisit');
    }
    const obj = this.repo.create({ email });
    return this.repo.save(obj);
  }

  // white listing will first check if there is a user which exist by the email
  // if it doesnt, it will throw an error
  // if it does, it will remove that instance of it.
  async whitelistUser(email: String) {
    const obj = await this.findOne(email);
    if (!obj) {
      throw new BadRequestException('User not blacklisted');
    }
    return await this.repo.remove(obj);
  }

  // this microservice, will find a blacklisted user
  async findOne(email: String) {
    if (!email) {
      return null;
    }
    var user = await this.repo.findOneBy({ email: Equal(email) });
    return user;
  }
}
