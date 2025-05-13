import { Module } from '@nestjs/common';
import { UsersCustomersService } from './users-customers.service';
import { UsersCustomersController } from './users-customers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema } from './schemas/customer.schema';
import { Event, EventSchema } from 'src/events/schemas/events.schema';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { JwtService } from '@nestjs/jwt';
import { EventsService } from 'src/events/events.service';
import { EventsModule } from 'src/events/events.module';
import { EmailService } from './other-services/email.service';
import { QRCodeService } from './other-services/qr-code.service';
import { QRCodeModule } from './other-services/qr-code.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Customer', schema: CustomerSchema },
      { name: Event.name, schema: EventSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EventsModule,
    QRCodeModule,
  ],
  controllers: [UsersCustomersController],
  providers: [
    UsersCustomersService,
    UsersService,
    JwtService,
    EventsService,
    EmailService,
  ],
})
export class UsersCustomersModule {}
