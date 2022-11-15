import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @ApiProperty({ type: String, description: 'name' })
  name: string;
  @ApiProperty({ type: String, description: 'email' })
  @IsEmail()
  @IsString()
  email: string;
  @IsString()
  @ApiProperty({ type: String, description: 'password' })
  password: string;
  @IsNumber()
  @Max(1)
  @Min(0)
  @ApiProperty({ type: Number, description: 'admin' })
  admin: number;
}
