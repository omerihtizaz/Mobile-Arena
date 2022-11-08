import { Expose, Transform } from 'class-transformer';
export class MobileDto {
  @Expose()
  name: String;
  @Expose()
  brand: String;
  @Expose()
  specs: String;
  @Expose()
  year: Number;
  @Expose()
  price: Number;
  @Expose()
  category: Number;
  @Transform(({ obj }) => obj.categories)
  @Expose()
  Category: any;
  @Transform(({ obj }) => obj.user)
  @Expose()
  Email: any;
}
