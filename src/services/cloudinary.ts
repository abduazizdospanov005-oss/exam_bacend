import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Multer — xotiraga saqlash (keyin Cloudinary ga yuklash uchun) */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Faqat rasm fayllari qabul qilinadi'));
  },
});

/** Rasmni Cloudinary ga yuklash */
export async function uploadImage(buffer: Buffer, folder = 'exam-system'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err || !result) reject(err || new Error('Upload failed'));
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

export default cloudinary;
