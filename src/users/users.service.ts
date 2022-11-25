import { Injectable, NotFoundException } from '@nestjs/common';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  // this will create the user and then save it to the repository
  async create(name: string, email: string, password: string, admin: number) {
    var user = await this.repo.create({ name, email, password, admin });
    return this.repo.save(user);
  }
  // this will find a user by their id.
  async findOne(id: number) {
    if (id == null) {
      return null;
    }
    var user = await this.repo.findOneBy({ id: id });
    if (!user) {
      return undefined;
    }
    return user;
  }
  // this will find a user by their email
  find(email: string) {
    return this.repo.find({ where: { email: Equal(email) } });
  }

  // this will remove the user by their rid, and if there is no user,
  // it will throw an error
  async remove(id: number) {
    var user = await this.repo.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    return this.repo.remove(user);
  }
}
