import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { Admin, AdminSchema } from './entities/admin.entity';
import { CreateAdminService } from './create-admin.service';
import { EventsService } from 'src/events/events.service';
import { UsersCustomersService } from 'src/users-customers/users-customers.service';
import { EventsModule } from 'src/events/events.module';
import { EventSchema, Event } from 'src/events/schemas/events.schema';
import { UsersCustomersModule } from 'src/users-customers/users-customers.module';
import { Customer, CustomerSchema } from 'src/users-customers/schemas/customer.schema';
import { QRCodeModule } from 'src/users-customers/other-services/qr-code.module';
import { EmailService } from 'src/users-customers/other-services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Event.name, schema: EventSchema },
      { name: Customer.name, schema: CustomerSchema},

    ]),
    UsersModule,
    EventsModule,
    UsersCustomersModule,
    QRCodeModule
  ],
  controllers: [AdminController],
  providers: [
    EventsService,
    AdminService,
    UsersService,
    JwtService,
    CreateAdminService,
    UsersCustomersService,
    EmailService
  ],
})
export class AdminModule {}
