import { Repository } from "typeorm";
import { hash } from "bcryptjs";
import { userInput } from "../../dto/auth.dto";
import { User } from "../../entity/user.entity";

export const registerUser = async (
  input: userInput,
  userRepository: Repository<User>
) => {
  try {
    const { fullName, email, password } = input;

    const userExists = await userRepository.findOne({
      where: { email },
    });

    if (userExists) {
      const error = new Error();
      error.message = "Email is not available";
      throw error;
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await userRepository.insert({
      fullName,
      email,
      password: hashedPassword,
      nBooks: 0,
    });

    return userRepository.findOne(newUser.identifiers[0].id);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
