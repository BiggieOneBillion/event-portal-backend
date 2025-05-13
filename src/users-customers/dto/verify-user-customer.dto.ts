import { IsString, IsEmail, IsNumber,min } from 'class-validator';

export class VeriferCustomer {
  @IsString({message:'Error!! Please Re-Login And Try again'})
  readonly eventId: string;
  @IsString()
  readonly access: string;
  @IsString()
  @IsEmail()
  readonly email: string;
  

}
