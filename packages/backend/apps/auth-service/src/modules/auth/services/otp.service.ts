import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateOtp(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailVerification(email: string, userId: string): Promise<void> {
    const otp = await this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (you might want to use Redis for this)
    // For now, we'll just log it
    console.log(`Email verification OTP for ${email}: ${otp}`);
    console.log(`Expires at: ${expiresAt}`);

    // TODO: Implement actual email sending
    // await this.sendEmail(email, 'Email Verification', `Your verification code is: ${otp}`);
  }

  async sendPhoneVerification(phone: string, userId: string): Promise<void> {
    const otp = await this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (you might want to use Redis for this)
    // For now, we'll just log it
    console.log(`Phone verification OTP for ${phone}: ${otp}`);
    console.log(`Expires at: ${expiresAt}`);

    // TODO: Implement actual SMS sending
    // await this.sendSMS(phone, `Your verification code is: ${otp}`);
  }

  async sendPasswordResetEmail(email: string, userId: string): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    // For now, we'll just log it
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Expires at: ${expiresAt}`);

    // TODO: Implement actual email sending
    // await this.sendEmail(email, 'Password Reset', `Reset your password: ${resetToken}`);

    return resetToken;
  }

  async verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    // TODO: Implement OTP verification from database/Redis
    // For now, we'll just return true for testing
    console.log(`Verifying OTP ${otp} for email ${email}`);
    return true;
  }

  async verifyPhoneOtp(phone: string, otp: string): Promise<boolean> {
    // TODO: Implement OTP verification from database/Redis
    // For now, we'll just return true for testing
    console.log(`Verifying OTP ${otp} for phone ${phone}`);
    return true;
  }

  async verifyPasswordResetToken(token: string): Promise<boolean> {
    // TODO: Implement token verification from database
    // For now, we'll just return true for testing
    console.log(`Verifying password reset token: ${token}`);
    return true;
  }

  private async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // TODO: Implement email sending using SendGrid or similar
    console.log(`Sending email to ${to}: ${subject}`);
    console.log(`Body: ${body}`);
  }

  private async sendSMS(to: string, message: string): Promise<void> {
    // TODO: Implement SMS sending using Twilio or similar
    console.log(`Sending SMS to ${to}: ${message}`);
  }
}
