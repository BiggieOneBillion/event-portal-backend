// src/verifier/verifier.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { Verifier, VerifierDocument } from './entities/verifiers.entity';
import { EventDocument } from '../events/schemas/events.schema';
import * as crypto from 'crypto';
import * as generator from 'generate-password';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';

@Injectable()
export class VerifierService {
  constructor(
    @InjectModel(Verifier.name) private verifierModel: Model<VerifierDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private jwtService: JwtService,
  ) {}

  // Generate verifier credentials and associate with an event
  async generateVerifier(
    eventId: string,
  ): Promise<{ email: string; password: string }> {
    const hash = crypto
      .createHash('sha256')
      .update(eventId + Date.now().toString())
      .digest('hex');
    const verifierEmail = `verifier-${hash.substring(0, 8)}@verifier.com`;
    const verifierPassword = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    try {
      const VerifierExist = await this.verifierModel.find({
        event: eventId,
      });
      // get the particular event because we need it to set the expiresAt
      const event = await this.eventModel.findById({ _id: eventId });

      const dateCheck =
        new Date(event.date).toLocaleDateString() <
        new Date().toLocaleDateString();

      const isEventDay =
        new Date(event.date).toLocaleDateString() ===
        new Date().toLocaleDateString();

      if (dateCheck) {
        // if the event has already passed, we don't need to create a verifier
        throw new BadRequestException('Event has already passed!');
      }

      if (!isEventDay) {
        throw new BadRequestException('Cannot Generate Login Because Event Day Still Ahead');
      }

      if (event.haveVerifiers) {
        throw new UnauthorizedException('Event already has verifiers');
      }

      // hash the password and save to the db
      const hashedPassword = await argon2.hash(verifierPassword);

      // create a verifier object
      const verifier = new this.verifierModel({
        email: verifierEmail,
        password: hashedPassword,
        event: eventId,
        expiresAt: new Date(event.date),
      });
      //  save the object in the database
      await verifier.save();
      //   update the event haveVerifiers field;
      event.haveVerifiers = true;
      event.verifiersDetails = {
        email: verifierEmail,
        password: verifierPassword,
      };
      //   then save the document
      await event.save();
      // Associate verifier with the event
      // ! would be implemented later if we want to have different credentials for different verifiers
      //   await this.eventModel.updateOne(
      //     { _id: eventId },
      //     { $push: { verifiers: verifier._id } },
      //   );

      return {
        email: verifierEmail,
        password: verifierPassword,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else if (error instanceof mongoose.Error.ValidationError) {
        // Handle validation errors
        const errorMessages = Object.values(error.errors).map(
          (error) => error.message,
        );
        throw new BadRequestException(
          'Invalid request',
          errorMessages.join(', '),
        );
      } else {
        // handle other errors (e.g database connection issues)
        console.error(error);
        throw new InternalServerErrorException('Internal Server Error');
        // return { message: 'Internal Server Error' };
      }
    }
  }

  // Validate verifier login
  async validateVerifier(
    email: string,
    password: string,
  ): Promise<{ message: string; token: string; event: object }> {
    try {
      const verifier = await this.verifierModel
        .findOne({ email: email })
        .exec();
      // console.log(verifier);

      if (!verifier) {
        throw new BadRequestException('Invalid email or password');
      }

      // if  user exists, check if the password is correct
      const isMatch = await argon2.verify(verifier.password, password);
      // console.log(isMatch);

      // if password is incorrect then send then return this message.
      if (!isMatch) {
        throw new BadRequestException('Invalid email or password');
      }

      // we look for the event  associated with the verifier
      const event = await this.eventModel.findById({ _id: verifier.event });
      if (!event) {
        throw new BadRequestException('Verifier not attached to any event');
      }
      const isEventPassed =
        new Date(event.date).toLocaleDateString() <
        new Date().toLocaleDateString();

      if (isEventPassed) {
        // if event has passed, delete the verifier info (i.e email and password)
        // await this.verifierModel.deleteOne({ email: email });
        await this.deleteVerifierDetails(event.id);
        // throw an error to let the user know the error
        throw new BadRequestException('Event has already passed');
      }
      // we check if the event date is equal to today's date
      const isAllowed =
        new Date(event.date).toLocaleDateString() ===
        new Date().toLocaleDateString();
      if (!isAllowed) {
        throw new UnauthorizedException(
          'Cannot sign-in, Event date is not today!',
        );
      }

      const payload = {
        sub: verifier.id,
        email: verifier.email,
        role: 'verifier',
        // eventDetails: event,
      };

      // console.log(payload);

      const accessToken = await this.jwtService.signAsync(payload);

      // console.log(accessToken);

      // successful request
      return {
        message: 'Successfully logged in',
        token: accessToken,
        event: event,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // re-throw the original BadRequestException
      } else if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException('Invalid request', error.errors);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid request data');
      } else {
        console.log(error);

        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async deleteVerifierDetails(eventId: string) {
    try {
      const deleteDetails = await this.verifierModel
        .findOneAndDelete({ event: eventId })
        .exec();
      if (!deleteDetails) {
        throw new NotFoundException('Verifier details not found');
      }
      const removeEventVerifierDetails = await this.eventModel.findById({
        _id: eventId,
      });
      if (!removeEventVerifierDetails) {
        throw new NotFoundException('Event does not exist');
      }
      delete removeEventVerifierDetails.verifiersDetails;
      removeEventVerifierDetails.haveVerifiers = false;
      await removeEventVerifierDetails.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
