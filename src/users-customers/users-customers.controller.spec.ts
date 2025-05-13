import { Test, TestingModule } from '@nestjs/testing';
import { UsersCustomersController } from './users-customers.controller';
import { UsersCustomersService } from './users-customers.service';

describe('UsersCustomersController', () => {
  let controller: UsersCustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersCustomersController],
      providers: [UsersCustomersService],
    }).compile();

    controller = module.get<UsersCustomersController>(UsersCustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
