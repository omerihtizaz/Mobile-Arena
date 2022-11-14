import { Mobile } from '../mobiles/mobile.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
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
}
