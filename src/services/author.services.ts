import { Repository } from "typeorm";
import {
  AuthorIdInput,
  AuthorInput,
  AuthorUpdateInput,
} from "../dto/author.dto";
import { Author } from "../entity/author.entity";

export const createAuthor = async (
  input: AuthorInput,
  authorRepository: Repository<Author>
) => {
  try {
    const createdAuthor = await authorRepository.insert({
      fullName: input.fullName,
    });
    const result = await authorRepository.findOne(
      createdAuthor.identifiers[0].id
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllAuthors = async (authorRepository: Repository<Author>) => {
  try {
    return await authorRepository.find({ relations: ["books"] });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAuthor = async (
  input: AuthorIdInput,
  authorRepository: Repository<Author>
) => {
  try {
    const author = await authorRepository.findOne(input.id, {
      relations: ["books"],
    });
    if (!author) {
      const error = new Error();
      error.message = "Author does not exist";
      throw error;
    }
    return author;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateAuthor = async (
  input: AuthorUpdateInput,
  authorRepository: Repository<Author>
) => {
  try {
    const authorExist = await authorRepository.findOne(input.id);

    if (!authorExist) {
      throw new Error("Author does not exist");
    }

    const updatedAuthor = await authorRepository.save({
      id: input.id,
      fullName: input.newName,
    });

    return await authorRepository.findOne(updatedAuthor.id);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const delateAuthor = async (
  input: AuthorIdInput,
  authorRepository: Repository<Author>
) => {
  try {
    const author = await authorRepository.findOne(input.id, {
      relations: ["books"],
    });
    if (!author) throw new Error("Author does not exist");
    if (
      author.books.some((book) => {
        book.isOnLoan === true;
      })
    )
      throw new Error("Author has a borrow book");

    await authorRepository.delete(input.id);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
