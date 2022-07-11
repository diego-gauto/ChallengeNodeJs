import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Author } from "../author/author.entity";
import { User } from "../user/user.entity";

@ObjectType()
@Entity()
export class Book {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field(() => Author)
  @ManyToOne(() => Author, (author) => author.books, { onDelete: "CASCADE" })
  author!: Author;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.books, { nullable: true })
  user!: User | null;

  @Field(() => Boolean)
  @Column()
  isOnLoan!: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  borrowBookDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  returnBookDate!: Date;

  @Field()
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: string;
}
