import { IsString, IsEmail, IsNumber,min } from 'class-validator';

export class CreateUsersCustomerDto {
  @IsString()
  readonly eventId: string;
  @IsString()
  readonly name: string;
  @IsString()
  @IsEmail()
  readonly email: string;
  @IsString()
  readonly location: string;
  @IsString()
  readonly phoneNumber: string;
}
