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

  @Post('/v1.0/create')
  @ApiBody({ type: CreateCategoryService })
  @ApiAcceptedResponse({ description: 'Create Category Portal' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Creation' })

  //  an end point to create categories. it takes in an argument of a dto
  // which has a single parameter in it, which uses class validation to check if it is a string.
  async create(@Body() body: CreateCategoryService) {
    return this.categoryService.create(body);
  }
  @Get('/v1.0/remove/:id')
  @ApiAcceptedResponse({ description: 'Delete Category Portal' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })

  // this endpoint removes a category if it already exist, based on their id provided.
  remove(@Param('id') id: Number) {
    this.categoryService.remove(id);
  }
}
