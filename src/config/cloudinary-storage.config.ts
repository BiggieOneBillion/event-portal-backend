// src/config/cloudinary-storage.config.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// // Configure Cloudinary storage for Multer
// export const CloudinaryStorageConfig = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'your_folder_name', // Optional: specify a folder in your Cloudinary account
//     allowedFormats: ['jpg', 'png', 'jpeg'],
//   },
// });

// Configure Cloudinary storage for Multer
export const CloudinaryStorageConfig = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    public_id: (req, file) => {
      return `uploads/${file.originalname}`;
    },
  },
});

//   const fileFilter = (req: any, file: any, cb: any) => {
//     if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
//       cb(new Error('Only JPEG, PNG and JPG files are allowed'));
//     } else {
//       cb(null, true);
//     }
//   };

//   const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//   });

//   export default upload;
