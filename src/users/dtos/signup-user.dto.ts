import { IsEmail, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsString()
  @ApiProperty({ type: String, description: 'name' })
  name: string;
  @IsEmail()
  @IsString()
  @ApiProperty({ type: String, description: 'email' })
  email: string;
  @IsString()
  @ApiProperty({ type: String, description: 'password' })
  password: string;
  @IsNumber()
  @ApiProperty({ type: Number, description: 'admin' })
  admin: number;
}
