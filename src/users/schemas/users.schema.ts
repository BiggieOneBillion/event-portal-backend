import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({required: true, unique: true})
  email: string;

  @Prop({ required: true, unique:true })
  company: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true})
  role: Role
}

export const UserSchema = SchemaFactory.createForClass(User);