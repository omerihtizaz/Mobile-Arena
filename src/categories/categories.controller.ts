import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryService } from './dtos/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}
  @Post('/create')
  async create(@Body() body: CreateCategoryService) {
    return this.categoryService.create(body);
  }
  @Get('remove/:id')
  remove(@Param('id') id: Number) {
    this.categoryService.remove(id);
  }
}
