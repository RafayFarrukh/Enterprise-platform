import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  // @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
  })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class AgencyRegisterDto {
  @ApiProperty({ example: 'agency@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
  })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  // Agency specific fields
  @ApiProperty({ example: 'Tech Solutions Inc.' })
  @IsString()
  agencyName: string;

  @ApiProperty({
    enum: [
      'TECHNICAL',
      'CONSTRUCTION',
      'REAL_ESTATE',
      'IMPORT_EXPORT',
      'VISA_TRAVEL',
      'SOLUTIONS',
    ],
  })
  @IsEnum([
    'TECHNICAL',
    'CONSTRUCTION',
    'REAL_ESTATE',
    'IMPORT_EXPORT',
    'VISA_TRAVEL',
    'SOLUTIONS',
  ])
  businessType: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E'])
  grade?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'We provide technical solutions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  serviceAreaCountry?: string;

  @ApiPropertyOptional({ example: 'California' })
  @IsOptional()
  @IsString()
  serviceAreaState?: string;

  @ApiPropertyOptional({ example: '["en", "es"]' })
  @IsOptional()
  supportedLanguages?: string[];

  @ApiPropertyOptional({
    enum: [
      'RANGE_01_30',
      'RANGE_30_70',
      'RANGE_70_150',
      'RANGE_150_300',
      'RANGE_300_500',
      'RANGE_500_700',
      'RANGE_700_1000_PLUS',
    ],
  })
  @IsOptional()
  @IsEnum([
    'RANGE_01_30',
    'RANGE_30_70',
    'RANGE_70_150',
    'RANGE_150_300',
    'RANGE_300_500',
    'RANGE_500_700',
    'RANGE_700_1000_PLUS',
  ])
  employeeRange?: string;

  @ApiPropertyOptional({ example: 'BR123456789' })
  @IsOptional()
  @IsString()
  businessRegNumber?: string;

  @ApiPropertyOptional({ example: 'TIN123456789' })
  @IsOptional()
  @IsString()
  taxIdNumber?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, State, 12345' })
  @IsOptional()
  @IsString()
  officeAddress?: string;
}
