import { IsEmail, Length } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class userInput {
  @Field()
  @Length(3, 20)
  fullName!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(8, 254)
  password!: string;
}

@InputType()
export class UserDeleteInput {
  @Field()
  userId!: number;
}

@ObjectType()
export class LoginResponse {
  @Field()
  userId!: number;

  @Field()
  jwt!: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  password!: string;
}
