import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private emailTransporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  async sendOtp(
    email: string | undefined,
    phone: string | undefined,
    type: string,
    userType: string,
    userId: string,
  ): Promise<void> {
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await this.prisma.otpCode.create({
      data: {
        userId,
        userType,
        email,
        phone,
        code,
        type,
        expiresAt,
      },
    });

    // Send OTP via email or phone
    if (email) {
      await this.sendEmailOtp(email, code, type);
    }
    if (phone) {
      await this.sendSmsOtp(phone, code, type);
    }
  }

  async verifyOtp(
    email: string | undefined,
    phone: string | undefined,
    code: string,
    type: string,
    userType: string,
  ): Promise<boolean> {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        email,
        phone,
        code,
        type,
        userType,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return true;
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendEmailOtp(email: string, code: string, type: string): Promise<void> {
    const subject = this.getEmailSubject(type);
    const html = this.getEmailTemplate(code, type);

    await this.emailTransporter.sendMail({
      from: this.configService.get<string>('email.from'),
      to: email,
      subject,
      html,
    });
  }

  private async sendSmsOtp(phone: string, code: string, type: string): Promise<void> {
    // TODO: Implement SMS service (Twilio, etc.)
    console.log(`SMS OTP for ${phone}: ${code}`);
  }

  private getEmailSubject(type: string): string {
    const subjects = {
      registration: 'Verify Your Account - Enterprise Platform',
      login: 'Login Verification Code - Enterprise Platform',
      password_reset: 'Password Reset Code - Enterprise Platform',
      email_verification: 'Email Verification Code - Enterprise Platform',
      phone_verification: 'Phone Verification Code - Enterprise Platform',
    };
    return subjects[type] || 'Verification Code - Enterprise Platform';
  }

  private getEmailTemplate(code: string, type: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 20px;">Enterprise Platform</h1>
          <h2 style="color: #666; margin-bottom: 30px;">Your Verification Code</h2>
          <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 5px; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666; font-size: 16px; margin: 20px 0;">
            This code will expire in 10 minutes.
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
