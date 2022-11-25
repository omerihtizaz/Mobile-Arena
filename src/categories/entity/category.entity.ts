import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: Number;

  @Column()
  name: String;

  // @ManyToMany(() => Mobile, (mobile) => mobile.categories)
  // Mobiles: Mobile[];
}
