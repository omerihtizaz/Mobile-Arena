import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCategoryService {
  @IsString()
  @ApiProperty({ type: String, description: 'name' })
  name: String;
}
