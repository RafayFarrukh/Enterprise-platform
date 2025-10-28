// Base User Interface
export interface BaseUser {
  id: string;
  userId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  permanentAddress?: Address;
  governmentId?: string;
  governmentIdType?: string;
  governmentIdDoc?: string;
  currency: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaMethod?: string;
  status: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Address Interface
export interface Address {
  country: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
}

// Agency Interface
export interface Agency extends BaseUser {
  agencyId: string;
  agencyLogo?: string;
  agencyName: string;
  businessType: string;
  serviceArea?: Address;
  grade?: string;
  supportedLanguages?: string[];
  employeeRange?: string;
  businessRegNumber?: string;
  taxIdNumber?: string;
  officeAddress?: Address;
  businessRegDoc?: string;
  taxVatDoc?: string;
  ag64FormDoc?: string;
  serviceDescription?: string;
  feeAmount: number;
  securityDepositAmount: number;
  totalDepositBalance: number;
  totalDueDeposit: number;
  totalPenaltyFee: number;
  renewalFee: number;
  renewalDate?: Date;
  establishmentDate?: Date;
  ranking: number;
}

// OAuth Client Interface
export interface OAuthClient {
  id: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  grants: string[];
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Access Token Interface
export interface AccessToken {
  id: string;
  token: string;
  clientId: string;
  userId?: string;
  userType?: string;
  scope?: string;
  expiresAt: Date;
  createdAt: Date;
}

// Refresh Token Interface
export interface RefreshToken {
  id: string;
  token: string;
  clientId: string;
  userId?: string;
  userType?: string;
  scope?: string;
  expiresAt: Date;
  createdAt: Date;
}

// User Session Interface
export interface UserSession {
  id: string;
  userId: string;
  userType: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Social Account Interface
export interface SocialAccount {
  id: string;
  userId: string;
  userType: string;
  provider: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// OTP Code Interface
export interface OtpCode {
  id: string;
  userId: string;
  userType: string;
  email?: string;
  phone?: string;
  code: string;
  type: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

// Activity Log Interface
export interface ActivityLog {
  id: string;
  userId: string;
  userType: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

// JWT Payload Interface
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  userType: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
}

// Pagination Interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated Response Interface
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Login Request Interface
export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  userType: 'user' | 'agency';
  rememberMe?: boolean;
}

// Register Request Interface
export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  currency: string;
  userType: 'user' | 'agency';
}

// OAuth Callback Interface
export interface OAuthCallback {
  provider: string;
  code: string;
  state?: string;
  redirectUri?: string;
}

// MFA Setup Interface
export interface MfaSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// Password Reset Interface
export interface PasswordReset {
  email: string;
  userType: 'user' | 'agency';
}

// Email Verification Interface
export interface EmailVerification {
  email: string;
  userType: 'user' | 'agency';
}

// Phone Verification Interface
export interface PhoneVerification {
  phone: string;
  userType: 'user' | 'agency';
}
