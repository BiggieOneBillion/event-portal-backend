import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { LogInAdminDto } from './dto/login-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './entities/admin.entity';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
  ) {}

  // LOGIN ADMIN services
  async login(
    loginAdminDto: LogInAdminDto,
  ): Promise<{ message: string; admin: { email: string; name: string } }> {
    try {
      // search the database to see if the user exists by using their email
      const user = await this.adminModel
        .findOne({ email: loginAdminDto.email })
        .exec();

      if (!user) {
        // if user does not exist return this message
        throw new UnauthorizedException('Unauthourized, User does not exist');
      }
      // if  user exists, check if the password is correct
      const isValidPassword = await argon2.verify(
        user.password,
        loginAdminDto.password,
      );

      // if password is incorrect then send then return this message.
      if (!isValidPassword) {
        throw new BadRequestException('Invalid email or password');
      }
      // create the JWT to be sent to the front end.
      // const payload = { sub: user.id, email: user.email };
      // const accessToken = await this.jwtService.signAsync(payload);
      // console.log(accessToken);
      // try {
      //   const accessToken = await this.jwtService.signAsync(payload);
      //   console.log(accessToken);
      // } catch (error) {
      //   console.error('Error generating access token:', error);
      //   throw new InternalServerErrorException('Failed to generate access token');
      // }
      // Login successful, return a token or the user object
      // For example, you can use a library like jsonwebtoken to generate a token
      return {
        message: 'Login Successful!',
        admin: { email: user.email, name: user.name },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // re-throw the original BadRequestException
      } else if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException('Invalid request', error.errors);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new NotFoundException('User not found');
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }
  // create(createAdminDto: CreateAdminDto) {
  //   return 'This action adds a new admin';
  // }

  // findAll() {
  //   return `This action returns all admin`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} admin`;
  // }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} admin`;
  // }
}
