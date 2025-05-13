import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { UsersCustomersService } from 'src/users-customers/users-customers.service';
import { UsersCustomersModule } from 'src/users-customers/users-customers.module';
import {
  Customer,
  CustomerSchema,
} from 'src/users-customers/schemas/customer.schema';
import { EventsModule } from 'src/events/events.module';
import { EventsService } from 'src/events/events.service';
import { Event, EventSchema } from 'src/events/schemas/events.schema';
import { QRCodeModule } from 'src/users-customers/other-services/qr-code.module';
import { EmailService } from 'src/users-customers/other-services/email.service';
import { VerifierModule } from 'src/verifiers/verifiers.module';
import { VerifierService } from 'src/verifiers/verifiers.service';
import { Verifier, VerifierSchema } from 'src/verifiers/entities/verifiers.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Event.name, schema: EventSchema },
      { name: Verifier.name, schema: VerifierSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        global: true,
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    UsersCustomersModule,
    EventsModule,
    QRCodeModule,
    VerifierModule
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersCustomersService,
    EventsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    EmailService,
    VerifierService
  ],
})
export class UsersModule {}
