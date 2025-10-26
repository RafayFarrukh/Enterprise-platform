import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ],
}));
