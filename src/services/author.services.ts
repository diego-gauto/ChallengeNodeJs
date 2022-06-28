import { Repository } from "typeorm";
import { UserInputError } from "apollo-server-express";
import {
  AuthorIdInput,
  AuthorInput,
  AuthorUpdateInput,
} from "../dto/author.dto";
import { Author } from "../entity/author.entity";
import logger from "../utils/logger/logger";
import { CustomError } from "../errors/custom.error";

export const createAuthor = async (
  input: AuthorInput,
  authorRepository: Repository<Author>
) => {
  //  try {
  const createdAuthor = await authorRepository.insert({
    fullName: input.fullName,
  });
  const result = await authorRepository.findOne(
    createdAuthor.identifiers[0].id
  );
  return result;
  // } catch (error: any) {
  //   throw (error);
  // }
};

export const getAllAuthors = async (authorRepository: Repository<Author>) => {
  //  try {
  return await authorRepository.find({ relations: ["books"] });
  // } catch (error: any) {
  //   throw (error);
  // }
};

export const getAuthor = async (
  input: AuthorIdInput,
  authorRepository: Repository<Author>
) => {
  //  try {
  const author = await authorRepository.findOne(input.id, {
    relations: ["books"],
  });
  if (!author) throw new CustomError("Author does not exist", "BAD_USER_INPUT");
  return author;
  // } catch (error: any) {
  //   throw new Error(error.message);
  // }
};

export const updateAuthor = async (
  input: AuthorUpdateInput,
  authorRepository: Repository<Author>
) => {
  //  try {
  const authorExist = await authorRepository.findOne(input.id);

  if (!authorExist)
    throw new CustomError("Author does not exist", "BAD_USER_INPUT");

  const updatedAuthor = await authorRepository.save({
    id: input.id,
    fullName: input.newName,
  });

  return await authorRepository.findOne(updatedAuthor.id);
  // } catch (error: any) {
  //   throw new Error(error.message);
  // }
};

export const deleteAuthor = async (
  input: AuthorIdInput,
  authorRepository: Repository<Author>
) => {
  // try {
  const author = await authorRepository.findOne(input.id, {
    relations: ["books"],
  });
  if (!author) throw new CustomError("Author does not exist", "BAD_USER_INPUT");

  if (author.books.some((book) => book.isOnLoan))
    throw new CustomError("Author has a borrow book", "BAD_USER_INPUT");

  await authorRepository.delete(input.id);
  return true;

  // } catch (error: any) {
  //   logger.error(error.message);
  //   throw new CustomError(error.message, 400);
  //}
};
