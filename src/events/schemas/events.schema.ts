import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import mongoose, { Document, Types } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';

export type EventDocument = Event & Document;

type verifierDetailsType = {
  email: string;
  password: string;
};

@Schema()
export class Event {
  // @Prop({ required: true, ref: 'User', type: mongoose.Schema.Types.ObjectId })
  // userId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  location: string;
  @Prop({ required: true })
  type:
    | 'Wedding'
    | 'Kids Show'
    | 'Church Events'
    | 'Adult Show'
    | 'All Ages'
    | 'Educational'
    | 'Conference'
    | 'Entertainment';
  @Prop({ required: true })
  noOfAttendees: number;
  @Prop({ required: true })
  date: string;
  @Prop({ required: true })
  startTimes: string[];
  @Prop({ required: true })
  endTimes: string[];
  @Prop({ required: true })
  eventImg: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  description: string;
  @Prop()
  registrationUrl: string;
  @Prop({ required: true })
  registrationStartDate: string;
  @Prop({ required: true })
  registrationEndDate: string;
  @Prop({ required: true })
  authType: 'barcode' | 'pincode';
  @Prop({ required: true })
  haveVerifiers: boolean;
  @Prop({ type: Object, default: {} })
  verifiersDetails: { email?: string; password?: string } | object;
  // ! would be implemented later if we want to have different credentials for different verifiers
  // @Prop({ type: [Types.ObjectId], ref: 'Verifier' })  // List of verifiers for the event
  // verifiers: Types.ObjectId[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Pre-save hook to generate the URL
EventSchema.pre('save', function (next) {
  if (!this.registrationUrl) {
    const encodedId = btoa(this._id.toString());
    const baseUrl = `${process.env.BASE_URL}/` || 'http://localhost:5174/'; // Make the base URL configurable
    this.registrationUrl = `${baseUrl}${encodedId}`;
  }
  next();
});
