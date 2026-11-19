import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretedtechjwtkey2026productionstyle987654321',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_edtechmock123',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'mocksecretkeyforrazorpayverification2026',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'mockwebhooksecret2026edtechkey',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads/materials',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
