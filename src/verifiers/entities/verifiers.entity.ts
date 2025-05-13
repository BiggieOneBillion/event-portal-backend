// src/schemas/verifier.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerifierDocument = Verifier & Document;

@Schema()
export class Verifier {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })  // Link to the event
  event: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({required: true})
  expiresAt: Date
}

export const VerifierSchema = SchemaFactory.createForClass(Verifier);

// Set TTL index on expiresAt field
// VerifierSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });