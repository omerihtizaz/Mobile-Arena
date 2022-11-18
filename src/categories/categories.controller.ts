import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryService } from './dtos/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}
  @Post('/create')
  @ApiBody({ type: CreateCategoryService })
  @ApiAcceptedResponse({ description: 'Create Category Portal' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Creation' })
  async create(@Body() body: CreateCategoryService) {
    return this.categoryService.create(body);
  }
  @Get('remove/:id')
  @ApiAcceptedResponse({ description: 'Delete Category Portal' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  remove(@Param('id') id: Number) {
    this.categoryService.remove(id);
  }
}
