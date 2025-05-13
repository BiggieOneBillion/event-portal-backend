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
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { LogInAdminDto } from './dto/login-admin.dto';
import { Public } from 'src/decorators/publicroute.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { EventsService } from 'src/events/events.service';
import { UsersCustomersService } from 'src/users-customers/users-customers.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly eventService: EventsService,
    private readonly userCustomerService: UsersCustomersService
  ) {}

  // LOGIN ADMIN
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginAdminDto: LogInAdminDto) {
    return this.adminService.login(loginAdminDto);
  }

  // GETTING INFO ABOUT THE USERS---CAN ONLY BE ACCESSED BY THE ADMIN
  // ------USERS INFO START -------//
  @Get()
  @UseGuards(RoleGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('user/:id')
  @UseGuards(RoleGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('user/:id')
  @UseGuards(RoleGuard)
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('user/:id')
  @UseGuards(RoleGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  // ------USERS INFO END -------//

  // -----EVENT INFO START ------//

  @Get('events')
  @UseGuards(RoleGuard)
  getAllEvents() {
    return this.eventService.getAllEvents();
  }

  // -----EVENT INFO END --------//

  // -------CUSTOMERS INFO START ----//


  // -------CUSTOMERS INFO ENDS ----//

  // @Post()
  // create(@Body() createAdminDto: CreateAdminDto) {
  //   return this.adminService.create(createAdminDto);
  // }

  // @Get()
  // findAll() {
  //   return this.adminService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.adminService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminService.update(+id, updateAdminDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.adminService.remove(+id);
  // }
}
