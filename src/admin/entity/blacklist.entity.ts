import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class BlackList {
  @PrimaryGeneratedColumn()
  id: Number;
  @Column()
  email: String;
}
