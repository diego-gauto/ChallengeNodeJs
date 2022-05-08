import { InputType, Field } from "type-graphql";
import { Length } from "class-validator";

@InputType()
export class AuthorInput {
  @Field()
  @Length(3, 20)
  fullName!: String;
}

@InputType()
export class AuthorIdInput {
  @Field()
  id!: number;
}

@InputType()
export class AuthorUpdateInput {
  @Field()
  id!: number;

  @Field()
  @Length(3, 20)
  newName?: string;
}
