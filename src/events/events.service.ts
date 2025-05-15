import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './schemas/events.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}
  async create(createEventDto: CreateEventDto, id: string) {
    try {
      // checking if the date of registration is less than the date
      let isDateInThePast = new Date(createEventDto.date) < new Date();

      if (isDateInThePast) {
        throw new BadRequestException('Date cannot be in the past');
      }

      // checking if the registration startdate is greater than the event date
      let isRegAfterEventDate =
        new Date(createEventDto.registrationStartDate) >
        new Date(createEventDto.date);
      if (isRegAfterEventDate) {
        throw new BadRequestException(
          'Registration date cannot be after the event date',
        );
      }

      // checking if the registration startdate is greater than the event date
      let isRegEDAfterEventDate =
        new Date(createEventDto.registrationEndDate) >
        new Date(createEventDto.date);
      if (isRegEDAfterEventDate) {
        throw new BadRequestException(
          'Registration cannot continue after the event date',
        );
      }

      // checking if the registration end date is less than the registration start date.
      let isRegEndDateBeforeStartDate =
        new Date(createEventDto.registrationStartDate) >
        new Date(createEventDto.registrationEndDate);
      if (isRegEndDateBeforeStartDate) {
        throw new BadRequestException(
          'Registration end date cannot be less than registration start date',
        );
      }

      // create the event obj from the this.eventModel
      const event = new this.eventModel({
        ...createEventDto,
        userId: id,
        haveVerifiers: false,
        verifiersDetails: {},
      });

      // save the event to the database
      const saveEvent = await event.save();

      // if successful then return the saved event
      return { message: 'Event Created', event: saveEvent };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof mongoose.Error.ValidationError) {
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
      }
    }
  }

  async findAll(id: string) {
    try {
      const events = await this.eventModel.find({ userId: id }).exec();
      // const events = await this.eventModel.find().populate('user').exec();
      // const events = await this.eventModel.find().populate({
      //   path: 'user',
      //   model: 'User',
      //   select: '_id name email',
      // });

      // console.log(events);

      if (!events) {
        throw new NotFoundException('Resources not found');
      }

      return { message: 'successful', data: events };
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid ID');
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async findOneEvent(id: string) {
    try {
      // Find all the  events that belong to the user
      const event = await this.eventModel.findById({ _id: id });

      //  If event is falsely, then throw error.
      if (!event) {
        throw new NotFoundException('Resources not found');
      }

      const data = {
        name: event.name,
        location: event.location,
        type: event.type,
        noOfAttendees: event.noOfAttendees,
        date: event.date,
        startTimes: event.startTimes,
        endTimes: event.endTimes,
        eventImg: event.eventImg,
        title: event.title,
        description: event.description,
        registrationStartDate: event.registrationStartDate,
        registrationEndDate: event.registrationEndDate,
        registrationUrl: event.registrationUrl,
      };

      //  If it exist, then return the array
      return {
        message: 'Successfully fetched the event one',
        data: { event: data },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException('Invalid request', error.errors);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Incorrect id data type');
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async findOne(id: string, userId: string) {
    try {
      // Find all the  events that belong to the user
      const event = await this.eventModel.find({ userId: userId }).exec();

      //  If event is falsely, then throw error.
      if (!event) {
        throw new NotFoundException('Resources not found');
      }

      // Check of the event id is in the event array---ie does the event exist
      const result = event.filter((item) => item.id === id);

      //  If it does not exist---meaning the result array is empty
      if (result.length === 0) {
        throw new NotFoundException('Event not found');
      }

      //  If it exist, then return the array
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException('Invalid request', error.errors);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Incorrect user id data type');
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    try {
      // We first check if the event exist under that particular users.
      // We do this by using the findOne function that returns an array if the event is found under that user.
      const result = await this.findOne(id, userId);

      if (!result || result instanceof Error) {
        console.error('Error finding event:', result);
        return; // or throw an error, depending on your requirements
        // but in this case we are not throwning an error because the error is thrown and handled in the findOne function.
        // but we return from the function so we can stop the execution of the update service function.
      }

      const updateEvent = await this.eventModel.findByIdAndUpdate(
        { _id: result[0].id },
        updateEventDto,
        { new: true },
      );
      if (!updateEvent) {
        throw new NotFoundException('Event does not exist');
      }
      return { message: 'Event updated successfully', data: updateEvent };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const result = await this.findOne(id, userId);

      if (!result || result instanceof Error) {
        console.error('Error finding event:', result);
        return; // or throw an error, depending on your requirements
      }

      const deletedEvent = await this.eventModel
        .findByIdAndDelete({ _id: result[0].id })
        .exec();
      if (!deletedEvent) {
        throw new NotFoundException('Event does not exist');
      }
      return { message: 'Event deleted successfully', data: deletedEvent };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  // THESE SERVICES ARE USED BY THE ADMIN AS THE ADMIN IS THE ONLY ONE ALLOWED TO USE THESE SERVICES
  // Get all events
  async getAllEvents(): Promise<{ message: string; data: Event[] }> {
    try {
      const events = await this.eventModel.find().exec();

      if (!events) {
        throw new NotFoundException('Resources not found');
      }

      return { message: 'Successfully gotten all services', data: events };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
