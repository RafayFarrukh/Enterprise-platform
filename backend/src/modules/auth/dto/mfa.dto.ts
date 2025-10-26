import { IsString, IsBoolean, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupMfaDto {
  @ApiProperty({
    description: 'User password for verification',
    example: 'SecurePassword123!',
  })
  @IsString()
  password: string;
}

export class VerifyMfaDto {
  @ApiProperty({
    description: 'MFA token from authenticator app',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'MFA token must be exactly 6 digits' })
  token: string;
}

export class EnableMfaDto {
  @ApiProperty({
    description: 'MFA token from authenticator app',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'MFA token must be exactly 6 digits' })
  token: string;
}

export class DisableMfaDto {
  @ApiProperty({
    description: 'MFA token from authenticator app',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'MFA token must be exactly 6 digits' })
  token: string;

  @ApiProperty({
    description: 'User password for verification',
    example: 'SecurePassword123!',
  })
  @IsString()
  password: string;
}
