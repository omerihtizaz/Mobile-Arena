import { Test, TestingModule } from '@nestjs/testing';
import { MobilesController } from './mobiles.controller';

describe('MobilesController', () => {
  let controller: MobilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobilesController],
    }).compile();

    controller = module.get<MobilesController>(MobilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
