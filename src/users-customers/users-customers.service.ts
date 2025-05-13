import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsersCustomerDto } from './dto/create-users-customer.dto';
import { UpdateUsersCustomerDto } from './dto/update-users-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import mongoose, { Model } from 'mongoose';
import { Event, EventDocument } from 'src/events/schemas/events.schema';
import { generateBarcodeId, generatePincode } from './util/functions';
import {
  QRCodeGenerationError,
  QRCodeService,
} from './other-services/qr-code.service';
import {
  EmailService,
  EmailServiceError,
} from './other-services/email.service';
import { log } from 'console';
// import { User } from 'src/users/entities/user.entity';
// import { UserDocument } from 'src/users/schemas/users.schema';

// TODO: Endpoint for getting all customers under a particular client.
@Injectable()
export class UsersCustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly qrCodeService: QRCodeService,
    private readonly emailService: EmailService,
    // @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async checkForEvent(eventId: string) {
    try {
      const event = await this.eventModel.findById({
        _id: eventId,
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      let check1 = new Date() < new Date(event.registrationStartDate);
      let check2 = new Date(event.registrationEndDate) < new Date();

      if (check1) {
        throw new NotAcceptableException(
          'Event registration has not started yet',
        );
      }
      if (check2) {
        throw new NotAcceptableException('Event registration has ended');
      }
      return { message: 'Event is active' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof NotAcceptableException
      ) {
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

  async create(createUsersCustomerDto: CreateUsersCustomerDto) {
    // console.log(createUsersCustomerDto);

    try {
      // check if the event is still up for registration
      const event = await this.eventModel.findOne({
        _id: createUsersCustomerDto.eventId,
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      let check1 = new Date() < new Date(event.registrationStartDate);
      let check2 =
        new Date(event.registrationEndDate).toLocaleDateString() <
        new Date().toLocaleDateString();

      if (check1) {
        throw new NotAcceptableException(
          'Event registration has not started yet',
        );
      }
      if (check2) {
        throw new NotAcceptableException('Event registration has ended');
      }

      // check if customer already exist for this particular event
      // we do this by checking if the customer is in the db,
      // and if so, we check if it is for the same event and if true.
      // We stop the registeration process and throw an error.
      const check = await this.customerModel.findOne({
        email: createUsersCustomerDto.email,
        eventId: createUsersCustomerDto.eventId,
      });

      // console.log(check);

      if (check) {
        throw new NotAcceptableException(
          'User Already Registered With This Email',
        );
      }

      // console.log('data before saving', createUsersCustomerDto);

      let customer: CustomerDocument;

      if (event.authType === 'barcode') {
        // logic for generating barcode id
        const barcodeId = generateBarcodeId();
        // Generate QR code and save the barcodeId in it
        const qrCodeBuffer = await this.qrCodeService.generateQRCode(barcodeId);
        // Send email with QR code attachment
        await this.emailService.sendEmail(
          'odell78@ethereal.email',
          'Your QR Code',
          'Please find your QR code attached.',
          [{ filename: 'qr-code.png', content: qrCodeBuffer }],
        );
        // create customer
        customer = new this.customerModel({
          ...createUsersCustomerDto,
          barcodeId: barcodeId,
          isVerfied: false,
        });
      } else {
        const pincode = generatePincode(event.name);

        // Send email with Pincode
        await this.emailService.sendEmail(
          'odell78@ethereal.email',
          'Your Pin Code',
          `This is your Pin code that would grant you access into the event - ${pincode}`,
        );
        // create customer
        customer = new this.customerModel({
          ...createUsersCustomerDto,
          pincode: pincode,
          isVerfied: false,
        });
      }

      await customer.save();

      // console.log('data formed by customer model', customer);

      // save the customer object in the database
      // const savedCustomer = await customer.save();
      // if saved properly, then return the customer object
      return {
        message: 'Customer registered successfully',
        data: customer,
      };
    } catch (error) {
      // PLEASE NOTE TO THYSELF----
      // remove the QRCodeGenerationError and EmailServiceError as theses errors,
      // even when caught is not supposed to be sent to the frontend but can be reported as an internal server error
      if (
        error instanceof NotAcceptableException ||
        error instanceof NotFoundException ||
        error instanceof QRCodeGenerationError ||
        error instanceof EmailServiceError
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
        // console.error(error);
        throw new InternalServerErrorException('Internal Server Error');
        // return { message: 'Internal Server Error' };
      }
    }
  }

  // for getting all available customers irrespective of events
  //  i dont know the use case for this yet
  async findAll() {
    try {
      const users = await this.customerModel.find().exec();
      if (!users) {
        throw new NotFoundException('Resources not found');
      }
      return { message: 'Successfully retrieved all cutomers', data: users };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  // used in the user controller to get all customers
  async findByEvent(
    eventId: string,
    userId: string,
  ): Promise<{ message: string; data: Customer[] }> {
    try {
      // check if  events exist under this customer
      const event = await this.eventModel.find({ userId: userId });
      // if no event, please throw an error
      if (!event) {
        throw new NotFoundException('User has no event');
      }

      // check if among the events user has, if this particular event exist
      const result = event.filter((item) => item.id === eventId);
      // if it does not exist, throw an error
      if (result.length === 0) {
        throw new NotFoundException('Event not found');
      }
      // if user has the event, find all the customers under this event
      const customers = await this.customerModel
        .find({ eventId: eventId })
        .exec();
      //  if no customers exist, return an error
      if (!customers) {
        throw new NotFoundException('No customer under this event');
      }
      // if  customers exist, return them
      return {
        message: 'Successfully retrieved all customers under this event',
        data: customers,
      };
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

  async verifyCustomer(email: string, access: string, eventId: string) {
    // console.log(email, access, eventId);
    try {
      const event = await this.eventModel.findById({ _id: eventId });

      if (!event) {
        throw new BadRequestException('Please Log In Again');
      }

      const customer = await this.customerModel.findOne({
        email: email,
        eventId: eventId,
      });

      

      if (!customer) {
        throw new UnauthorizedException('Customer not registered');
      }


      if (customer.isVerfied) {
         throw new UnauthorizedException('Customer already verified');
      }

      // next we check if the provided pincode or qr code matches the one the user provided.
      if (event.authType === 'pincode' && customer.pincode === access) {
        // update the isVerified value to true to show that the  user has been verified / signed in at the event point
        customer.isVerfied = true;
        // save the customer details with the update
        await customer.save();
        // return success message and the customer details
        return { message: 'Verified', data: customer };
      } else if (
        event.authType === 'barcode' &&
        customer.barcodeId === access
      ) {
        customer.isVerfied = true;
        await customer.save();
        return { message: 'Verified', data: customer };
      } else {
        throw new BadRequestException('Invalid details');
      }
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException('Invalid request', error.errors);
      } else if (error instanceof mongoose.Error.CastError) {
        throw new BadRequestException('Invalid request data');
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} usersCustomer`;
  }

  update(id: number, updateUsersCustomerDto: UpdateUsersCustomerDto) {
    return `This action updates a #${id} usersCustomer`;
  }

  remove(id: number) {
    return `This action removes a #${id} usersCustomer`;
  }
}
