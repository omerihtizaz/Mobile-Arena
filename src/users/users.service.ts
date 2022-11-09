import { Injectable, NotFoundException } from '@nestjs/common';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(name: string, email: string, password: string, admin: number) {
    var user = await this.repo.create({ name, email, password, admin });
    return this.repo.save(user);
  }

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

  find(email: string) {
    return this.repo.find({ where: { email: Equal(email) } });
  }

  async remove(id: number) {
    var user = await this.repo.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('NotFoundException');
    }
    return this.repo.remove(user);
  }
}
