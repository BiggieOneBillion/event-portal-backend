import { IsEmail, IsString, Matches, MinLength } from 'class-validator'
export class LogInAdminDto {
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
      })
    password: string;
}