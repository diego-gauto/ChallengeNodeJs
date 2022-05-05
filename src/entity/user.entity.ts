import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Any,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Book } from "./book.entity";

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  fullName!: string;

  @Field()
  @Column()
  email!: string;

  @Field()
  @Column()
  password!: string;

  @Field()
  @Column()
  nBooks!: number;

  @Field(() => [Book], { nullable: true })
  @OneToMany(() => Book, (book) => book.user, { nullable: true })
  books!: Book[];

  @Field()
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: string;
}
