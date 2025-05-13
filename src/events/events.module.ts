import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/events.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { CloudinaryModule } from 'src/cloudinary.module';
import { VerifierService } from 'src/verifiers/verifiers.service';
import { VerifierModule } from 'src/verifiers/verifiers.module';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
