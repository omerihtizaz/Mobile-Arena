import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsArray,
  IsEmail,
} from 'class-validator';
import { Category } from '../../categories/category.entity';

export class CreateMobileDto {
  @IsString()
  name: String;
  @IsString()
  brand: String;
  @IsString()
  specs: String;
  @IsNumber()
  @Min(2012)
  @Max(2021)
  year: Number;
  @IsNumber()
  @Min(0)
  @Max(10000)
  price: Number;
  @IsArray()
  categories: [];
}
