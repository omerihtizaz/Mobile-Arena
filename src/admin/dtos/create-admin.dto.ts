import { IsEmail, IsNumber, IsString } from 'class-validator';
export class CreateAdminDto {
  @IsString()
  name: string;
  @IsEmail()
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsNumber()
  admin: number;
}
