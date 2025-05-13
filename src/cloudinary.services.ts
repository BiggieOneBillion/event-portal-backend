// // src/services/cloudinary.service.ts
// import { Injectable, Inject } from '@nestjs/common';
// // import { v2 as cloudinary } from 'cloudinary';

// @Injectable()
// export class CloudinaryService {
//   constructor(@Inject('Cloudinary') private cloudinary) {}

//   async uploadImage(file: Express.Multer.File): Promise<any> {
//     return new Promise((resolve, reject) => {
//       this.cloudinary.uploader.upload_stream((error, result) => {
//         if (error) {
//           return reject(error);
//         }
//         resolve(result);
//       }).end(file.buffer);
//     });
//   }
// }
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('Cloudinary') private readonly cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url }); // Return the secure URL from Cloudinary
        },
      ).end(file.buffer); // Pass the file buffer
    });
  }
}