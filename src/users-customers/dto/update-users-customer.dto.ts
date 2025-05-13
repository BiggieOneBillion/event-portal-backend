import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersCustomerDto } from './create-users-customer.dto';

export class UpdateUsersCustomerDto extends PartialType(CreateUsersCustomerDto) {}
