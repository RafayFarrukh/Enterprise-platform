import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsEnum(['user', 'agency'])
  accountType?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  mfaCode?: string;

  @ApiPropertyOptional({ example: 'remember-me-token' })
  @IsOptional()
  @IsString()
  rememberMe?: string;
}

export class SocialLoginDto {
  @ApiProperty({ example: 'google' })
  @IsEnum(['google', 'github', 'facebook', 'linkedin'])
  provider: string;

  @ApiProperty({ example: 'social-auth-code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsEnum(['user', 'agency'])
  accountType?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token-here' })
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @ApiPropertyOptional({ example: 'refresh-token-here' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({ example: 'all' })
  @IsOptional()
  @IsEnum(['current', 'all'])
  logoutType?: string;
}
