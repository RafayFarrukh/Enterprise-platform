import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnableMfaDto {
  @ApiProperty({ example: 'email' })
  @IsEnum(['email', 'phone', 'totp'])
  method: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class VerifyMfaDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'backup-code-123' })
  @IsOptional()
  @IsString()
  backupCode?: string;
}

export class DisableMfaDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password: string;
}

export class GenerateBackupCodesDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}
