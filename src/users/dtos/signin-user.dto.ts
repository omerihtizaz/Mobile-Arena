import { IsEmail, IsString } from 'class-validator';
export class SignInUserDto {
  @IsEmail()
  @IsString()
  email: string;
  @IsString()
  password: string;
}
