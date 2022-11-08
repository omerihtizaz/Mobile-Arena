import { IsEmail, IsString } from 'class-validator';
export class SigninAdminDto {
  @IsEmail()
  @IsString()
  email: string;
  @IsString()
  password: string;
}
