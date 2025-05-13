import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { UsersCustomersModule } from './users-customers/users-customers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { QRCodeModule } from './users-customers/other-services/qr-code.module';
import { VerifierModule } from './verifiers/verifiers.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // this settings is optional -- would work  without it
    }),
    MongooseModule.forRoot(
      process.env.DATABASE_URI,
    ),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     secret: configService.get('JWT_SECRET'),
    //     global: true,
    //     signOptions: { expiresIn: '1d' },
    //   }),
    //   inject: [ConfigService],
    // }),
    ScheduleModule.forRoot(),
    UsersModule,
    EventsModule,
    UsersCustomersModule,
    AdminModule,
    VerifierModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
