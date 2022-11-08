import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryService } from './dtos/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}
  @Post('/create')
  //   @UseGuards(AuthGuard)
  //   @Serialize(ReportDto)
  async create(@Body() body: CreateCategoryService) {
    console.log(body);
    return this.categoryService.create(
      body,
      //   await this.userService.findOne(session.userID),
    );
  }
  @Get('remove/:id')
  remove(@Param('id') id: Number) {
    this.categoryService.remove(id);
  }
}
