import { getRepository, Repository } from "typeorm";
import { AuthorIdInput, AuthorInput, AuthorUpdateInput } from "./author.dto";
import { Author } from "./author.entity";
import { CustomError } from "../errors/custom.error";
import { NotAuthorError } from "../errors/notAuthor.error";
import { DeleteAuthorError } from "../errors/deleteAuthor.error";

export default class AuthorServices {
  private authorRepository: Repository<Author>;

  constructor() {
    this.authorRepository = getRepository(Author);
  }

  createAuthor = async (input: AuthorInput) => {
    const createdAuthor = await this.authorRepository.insert({
      fullName: input.fullName,
    });
    const result = await this.authorRepository.findOne(
      createdAuthor.identifiers[0].id
    );
    return result;
  };

  getAllAuthors = async () => {
    return await this.authorRepository.find({ relations: ["books"] });
  };

  getAuthor = async (input: AuthorIdInput) => {
    const author = await this.authorRepository.findOne(input.id, {
      relations: ["books", "books.author"],
    });
    if (!author) throw new NotAuthorError();
    return author;
  };

  updateAuthor = async (input: AuthorUpdateInput) => {
    const authorExist = await this.authorRepository.findOne(input.id);

    if (!authorExist) throw new NotAuthorError();

    const updatedAuthor = await this.authorRepository.save({
      id: input.id,
      fullName: input.newName,
    });

    return await this.authorRepository.findOne(updatedAuthor.id);
  };

  deleteAuthor = async (input: AuthorIdInput) => {
    const author = await this.authorRepository.findOne(input.id, {
      relations: ["books"],
    });
    if (!author) throw new NotAuthorError();

    if (author.books.some((book) => book.isOnLoan))
      throw new DeleteAuthorError();

    await this.authorRepository.delete(input.id);
    return true;
  };
}
