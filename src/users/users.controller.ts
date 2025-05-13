import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LogInUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/decorators/publicroute.decorator';
import { UsersCustomersService } from 'src/users-customers/users-customers.service';
import { VerifierService } from 'src/verifiers/verifiers.service';
import { log } from 'console';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly customerServices: UsersCustomersService,
    private readonly verifierService: VerifierService
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @UsePipes(ValidationPipe)
  logInUser(@Body() loginUserDto: LogInUserDto) {
    if (loginUserDto.email.endsWith('@verifier.com')) {   
      return this.verifierService.validateVerifier(loginUserDto.email, loginUserDto.password)
    }
    return this.usersService.login(loginUserDto);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('customers/:eventId')
  findAllCustomersByEvent(
    @Param('eventId') eventId: string,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    return this.customerServices.findByEvent(eventId, userId);
  }
}
