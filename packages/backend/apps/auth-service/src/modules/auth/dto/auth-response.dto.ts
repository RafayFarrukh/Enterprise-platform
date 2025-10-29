import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 900 })
  expiresIn: number;

  @ApiProperty({ example: 'user123' })
  userId: string;

  @ApiPropertyOptional({ example: 'user' })
  accountType?: string;

  @ApiPropertyOptional({ example: false })
  mfaRequired?: boolean;

  @ApiPropertyOptional({ example: 'email' })
  mfaMethod?: string;
}

export class UserProfileDto {
  @ApiProperty({ example: 'user123' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  profilePhoto?: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: false })
  emailVerified: boolean;

  @ApiProperty({ example: false })
  phoneVerified: boolean;

  @ApiProperty({ example: false })
  mfaEnabled: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class AgencyProfileDto {
  @ApiProperty({ example: 'agency123' })
  id: string;

  @ApiProperty({ example: 'agency@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'Tech Solutions Inc.' })
  agencyName: string;

  @ApiProperty({ example: 'TECHNICAL' })
  businessType: string;

  @ApiProperty({ example: 'A' })
  grade: string;

  @ApiProperty({ example: 0 })
  ranking: number;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logo?: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: false })
  emailVerified: boolean;

  @ApiProperty({ example: false })
  phoneVerified: boolean;

  @ApiProperty({ example: false })
  mfaEnabled: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class MfaSetupResponseDto {
  @ApiProperty({ example: 'otpauth://totp/Enterprise%20Platform:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Enterprise%20Platform' })
  qrCodeUrl: string;

  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP' })
  secret: string;

  @ApiProperty({ example: ['backup-code-1', 'backup-code-2', 'backup-code-3'] })
  backupCodes: string[];
}

export class TokenValidationResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiPropertyOptional({ example: 'user123' })
  userId?: string;

  @ApiPropertyOptional({ example: 'user' })
  accountType?: string;

  @ApiPropertyOptional({ example: 'Token expired' })
  error?: string;
}
