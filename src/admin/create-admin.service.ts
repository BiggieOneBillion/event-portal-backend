import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { Admin, AdminDocument, Role } from './entities/admin.entity';

@Injectable()
export class CreateAdminService implements OnModuleInit {
  constructor(@InjectModel(Admin.name) private adminModel: Model<AdminDocument>) {}

  async onModuleInit() {
    await this.createSuperAdmin();
  }

  private async createSuperAdmin() {
    const superAdminEmail = 'admin@pmail.com';
    const superAdminExists = await this.adminModel.findOne({ email: superAdminEmail });

    if (!superAdminExists) {
      const hashedPassword = await argon2.hash('QwerTY09@'); 
      const superAdmin = new this.adminModel({
        name:'John Jones',
        email: superAdminEmail,
        password: hashedPassword,
        role: Role.Admin, 
      });

      await superAdmin.save();
      console.log('Super admin created successfully.');
    } else {
      console.log('Super admin already exists.');
    }
  }
}