import { Test, TestingModule } from '@nestjs/testing';
import { UsersCustomersService } from './users-customers.service';

describe('UsersCustomersService', () => {
  let service: UsersCustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersCustomersService],
    }).compile();

    service = module.get<UsersCustomersService>(UsersCustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
