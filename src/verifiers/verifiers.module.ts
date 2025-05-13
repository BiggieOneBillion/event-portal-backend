import { Module } from '@nestjs/common';
import { VerifierSchema } from './entities/verifiers.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { VerifierController } from './verifiers.controller';
import { VerifierService } from './verifiers.service';
import { EventsModule } from 'src/events/events.module';
import { EventSchema } from 'src/events/schemas/events.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Verifier', schema: VerifierSchema },
      { name: 'Event', schema: EventSchema },
    ]),
    EventsModule,
  ],
  controllers: [VerifierController],
  providers: [VerifierService, JwtService],
})
export class VerifierModule {}
