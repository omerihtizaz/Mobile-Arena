import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
@Entity()
export class Mobile {
  @PrimaryColumn()
  name: String;
  @Column()
  brand: String;
  @Column()
  specs: String;
  @Column()
  year: Number;
  @Column()
  price: Number;
  @ManyToMany(() => Category, {
    cascade: ['update', 'insert'],
  })
  @JoinTable()
  categories: Category[];

  @ManyToOne(() => User, (user) => user.mobiles)
  user: User;
}
