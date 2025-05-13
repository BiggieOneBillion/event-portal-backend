import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}

@Schema()
export class Admin {
  @Prop({ required: true })
  name: string;

  @Prop({required: true, unique: true})
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true})
  role: Role.Admin
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
