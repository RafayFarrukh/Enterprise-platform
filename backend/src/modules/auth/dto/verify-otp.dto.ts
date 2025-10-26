import { IsString, IsEnum, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '@prisma/client';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'OTP token',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  token: string;

  @ApiProperty({
    description: 'Type of OTP verification',
    enum: OtpType,
    example: OtpType.SIGNUP,
  })
  @IsEnum(OtpType, { message: 'Invalid OTP type' })
  type: OtpType;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'Type of OTP to resend',
    enum: OtpType,
    example: OtpType.SIGNUP,
  })
  @IsEnum(OtpType, { message: 'Invalid OTP type' })
  type: OtpType;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'OTP token for password reset',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePassword123!',
  })
  @IsString()
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  newPassword: string;
}
