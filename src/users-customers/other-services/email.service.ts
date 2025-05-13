import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export class EmailServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'odell78@ethereal.email',
      pass: '1uyz7qDMdFpNrbzKQb',
    },
  });

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachments?: any[],
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: 'odell78@ethereal.email',
        to,
        subject,
        text,
        attachments,  
      });
    } catch (error) {
      console.log(error);
      
      throw new EmailServiceError('Failed to send email');
    }
  }



}
