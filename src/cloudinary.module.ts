// src/cloudinary/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './providers/cloudinary.providers';
import { CloudinaryService } from './cloudinary.services';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService], // Register provider and service
  exports: [CloudinaryService], // Export the service for use in other modules
})
export class CloudinaryModule {}
