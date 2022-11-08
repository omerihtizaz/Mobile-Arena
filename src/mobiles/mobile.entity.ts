import {
  AfterRemove,
  AfterUpdate,
  AfterInsert,
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  DeleteDateColumn,
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
  @AfterInsert()
  logInsert() {
    console.log('Inserted Mobile with name: ', this.name);
  }
  @AfterRemove()
  logRemove() {
    console.log('Mobile with name: ', this.name, ' has been removed.');
  }
  @AfterUpdate()
  logUpdate() {
    console.log(' Mobile with name: ', this.name, ' has been Updated.');
  }
}
