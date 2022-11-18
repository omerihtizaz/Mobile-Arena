import { IsString, IsNumber, Min, Max, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMobileDto {
  @IsString()
  @ApiProperty({ type: String, description: 'name' })
  name: String;
  @IsString()
  @ApiProperty({ type: String, description: 'brand' })
  brand: String;
  @IsString()
  @ApiProperty({ type: String, description: 'specs' })
  specs: String;
  @IsNumber()
  @Min(2012)
  @Max(2021)
  @ApiProperty({ type: Number, description: 'year' })
  year: Number;
  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiProperty({ type: Number, description: 'price' })
  price: Number;
  @IsArray()
  @ApiProperty({ type: Array, description: 'name' })
  categories: [];
}
