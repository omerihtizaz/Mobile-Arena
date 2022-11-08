import { IsString } from 'class-validator';
export class CreateCategoryService {
  @IsString()
  name: String;
}
