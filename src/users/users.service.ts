import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogInUserDto } from './dto/login-user.dto';
import mongoose, { Model } from 'mongoose';
import { Role, User, UserDocument } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    console.log(createUserDto);
    try {
      // hash the password and save to the db
      const hashedPassword = await argon2.hash(createUserDto.password);
      // create a new userModel object
      const user = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        role: Role.User,
      });
      // save it to database
      await user.save();
      // if successful, return the statement below
      return { message: 'User Created Successfully' };
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        // Handle validation errors
        const errorMessages = Object.values(error.errors).map(
          (error) => error.message,
        );
        throw new BadRequestException(
          'Invalid request',
          errorMessages.join(', '),
        );
      } else if (error.code === 11000) {
        // Handle duplicate key error
        // console.log(error.keyPattern);

        const fieldName = Object.keys(error.keyPattern)[0];

        // throw new ConflictException(`Duplicate ${fieldName} value: ${error.keyPattern[fieldName]}`);
        throw new ConflictException(`${fieldName} already exist `);
      } else {
        // handle other errors (e.g database connection issues)
        console.error(error);
        throw new InternalServerErrorException('Internal Server Error');
        // return { message: 'Internal Server Error' };
      }
    }
  }

  async login(
    loginUserDto: LogInUserDto,
  ): Promise<{ message: string; token: string }> {
    try {
      // search the database to see if the user exists by using their email
      const user = await this.userModel
        .findOne({ email: loginUserDto.email })
        .exec();

      if (!user) {
        // if user does not exist return this message
        throw new BadRequestException('Invalid email or password');
        // throw new UnauthorizedException('Unauthourized, User does not exist');
      }
      // if  user exists, check if the password is correct
      const isValidPassword = await argon2.verify(
        user.password,
        loginUserDto.password,
      );

      // if password is incorrect then send then return this message.
      if (!isValidPassword) {
        throw new BadRequestException('Invalid email or password');
      }

      // create the JWT to be sent to the front end.
      const payload = { sub: user.id, email: user.email };
      // console.log(user.id);
      // console.log(user.email);
      // try
      const accessToken = await this.jwtService.signAsync(payload);
       
      // Login successful, return a token or the user object
      // For example, you can use a library like jsonwebtoken to generate a token
      return { message: 'Login Successful!', token: accessToken };
    } catch (error) {
      // if (error instanceof NotFoundException) {
      //   throw error; // re-throw the original BadRequestException
      // }
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // re-throw the original BadRequestException
      } else if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException('Invalid request', error.errors);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new NotFoundException('Invalid request data');
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  //  THESE SERVICES ARE USED IN THE ADMIN CONTROLLER--AS ONLY THE ADMIN CAN AND SHOULD BE ABLE TO HANDLE AND SEE THIS DATA

  async findAll(): Promise<{ message: string; data: User[] }> {
    try {
      const users = await this.userModel.find().exec();
      if (!users) {
        throw new NotFoundException('Resources not found');
      }
      return { message: 'Successfully retrieved all users', data: users };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findOne(id: string): Promise<{ message: string; data: User }> {
    try {
      const users = await this.userModel.findById({ _id: id }).exec();
      if (!users) {
        throw new NotFoundException('User not found');
      }
      return { message: 'Successfully  retrieved user', data: users };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException('Invalid request', error.errors);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Incorrect user id data type');
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    try {
      const deletedUsers = await this.userModel
        .findByIdAndDelete({ _id: id })
        .exec();
      if (!deletedUsers) {
        throw new NotFoundException('User not found');
      }
      return { message: 'user deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
    // return `This action removes a #${id} user`;
  }
}
