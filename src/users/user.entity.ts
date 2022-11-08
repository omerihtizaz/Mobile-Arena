import { Mobile } from '../mobiles/mobile.entity';
import {
  AfterRemove,
  AfterUpdate,
  AfterInsert,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: String;
  @Column()
  email: String;
  @Column()
  password: String;
  @Column({ default: 0 })
  admin: number;
  @OneToMany(() => Mobile, (mobile) => mobile.user)
  mobiles: Mobile[];
  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id: ', this.id, ' and name: ', this.name);
  }
  @AfterRemove()
  logRemove() {
    console.log(
      'User with id: ',
      this.id,
      ' and name: ',
      this.name,
      ' has been removed.',
    );
  }
  @AfterUpdate()
  logUpdate() {
    console.log(
      'User with id: ',
      this.id,
      ' and name: ',
      this.name,
      ' has been Updated.',
    );
  }
}
