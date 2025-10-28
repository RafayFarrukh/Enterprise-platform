// User Status Enum
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  DORMANT = 'DORMANT',
  CLOSED = 'CLOSED',
}

// Agency Status Enum
export enum AgencyStatus {
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  DORMANT = 'DORMANT',
  CLOSED = 'CLOSED',
}

// Business Type Enum
export enum BusinessType {
  TECHNICAL = 'TECHNICAL',
  CONSTRUCTION = 'CONSTRUCTION',
  REAL_ESTATE = 'REAL_ESTATE',
  COMMERCIAL_INDUSTRIAL = 'COMMERCIAL_INDUSTRIAL',
  VISA_TRAVEL = 'VISA_TRAVEL',
  IMPORT_EXPORT = 'IMPORT_EXPORT',
  SOLUTIONS = 'SOLUTIONS',
}

// OTP Type Enum
export enum OtpType {
  LOGIN = 'login',
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  MFA_VERIFICATION = 'mfa_verification',
}

// MFA Method Enum
export enum MfaMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  TOTP = 'totp',
}

// User Type Enum
export enum UserType {
  USER = 'user',
  AGENCY = 'agency',
  ADMIN = 'admin',
}

// OAuth Provider Enum
export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
}

// Order Status Enum
export enum OrderStatus {
  PENDING = 'PENDING',
  PAYMENT = 'PAYMENT',
  WAITING = 'WAITING',
  WORKING = 'WORKING',
  STOPPED = 'STOPPED',
  COMPLETE = 'COMPLETE',
  DELIVERY = 'DELIVERY',
  REFUND = 'REFUND',
  CANCEL = 'CANCEL',
}

// Transaction Status Enum
export enum TransactionStatus {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
  UNACCEPTABLE = 'UNACCEPTABLE',
}

// Payment Method Enum
export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

// Currency Enum
export enum Currency {
  USD = 'USD',
  BDT = 'BDT',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
}

// Gender Enum
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

// Government ID Type Enum
export enum GovernmentIdType {
  NID = 'NID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
}

// Employee Range Enum
export enum EmployeeRange {
  '01-30' = '01-30',
  '30-70' = '30-70',
  '70-150' = '70-150',
  '150-300' = '150-300',
  '300-500' = '300-500',
  '500-700' = '500-700',
  '700-1000+' = '700-1000+',
}

// Agency Grade Enum
export enum AgencyGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

// Priority Level Enum
export enum PriorityLevel {
  LOW = 'Low Priority',
  NORMAL = 'Normal',
  MEDIUM = 'Medium',
  HIGH = 'High Priority',
}

// Project Type Enum
export enum ProjectType {
  PERSONAL = 'Personal',
  COMPANY = 'Company',
  CLIENT = 'Client',
  NON_PROFIT = 'Non-Profit',
  GOVERNMENT = 'Government',
  COLLABORATION = 'Collaboration',
  DEVELOPMENTAL = 'Developmental',
}
