import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  @Prop({ required: true, ref: 'Event', type: mongoose.Schema.Types.ObjectId })
  // @Prop({ required: true })
  eventId: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  phoneNumber: string;
  @Prop({ required: true })
  location: string;
  @Prop({ required: false })
  barcodeId: string;
  @Prop({ required: false })
  pincode: string;
  @Prop({ required: true })
  isVerfied: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

//  custom validation function to the schema
//  custom validation function to ensure only one of barcodeId or pincode is present
CustomerSchema.pre('validate', function (next) {
  // If both are present, or neither is present, throw a validation error
  if (this.barcodeId && this.pincode) {
    this.invalidate('barcodeId', 'Cannot have both barcodeId and pincode');
    this.invalidate('pincode', 'Cannot have both barcodeId and pincode');
  } else if (!this.barcodeId && !this.pincode) {
    this.invalidate('barcodeId', 'Must have either barcodeId or pincode');
  }
  next();
});
