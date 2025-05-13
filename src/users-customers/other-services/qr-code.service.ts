import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

export class QRCodeGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QRCodeGenerationError';
  }
}

@Injectable()
export class QRCodeService {
  async generateQRCode(data: string): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(data);
    } catch (error) {
      throw new QRCodeGenerationError('Failed to generate QR code');
    }
  }
}
