import { InputType, Field, Int } from "type-graphql";
import { Length } from "class-validator";

@InputType()
export class BookInput {
  @Field()
  @Length(3, 20)
  title!: string;

  @Field()
  authorId!: number;
}

@InputType()
export class BookIdInput {
  @Field(() => Number)
  bookId!: number;
}

@InputType()
export class BookUpdateInput {
  @Field()
  id!: number;

  @Field(() => String, { nullable: true })
  @Length(3, 20)
  newTitle?: string;

  @Field(() => Number, { nullable: true })
  newAuthor?: number;
}

@InputType()
export class BorrowBookInput {
  @Field()
  bookId!: number;

  @Field(() => Number)
  userId!: number;
}
