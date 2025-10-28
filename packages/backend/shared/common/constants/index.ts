// User Status Constants
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
  DORMANT: 'DORMANT',
  CLOSED: 'CLOSED',
} as const;

// Agency Status Constants
export const AGENCY_STATUS = {
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
  DORMANT: 'DORMANT',
  CLOSED: 'CLOSED',
} as const;

// Business Type Constants
export const BUSINESS_TYPE = {
  TECHNICAL: 'TECHNICAL',
  CONSTRUCTION: 'CONSTRUCTION',
  REAL_ESTATE: 'REAL_ESTATE',
  COMMERCIAL_INDUSTRIAL: 'COMMERCIAL_INDUSTRIAL',
  VISA_TRAVEL: 'VISA_TRAVEL',
  IMPORT_EXPORT: 'IMPORT_EXPORT',
  SOLUTIONS: 'SOLUTIONS',
} as const;

// OTP Types
export const OTP_TYPE = {
  LOGIN: 'login',
  REGISTRATION: 'registration',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
  PHONE_VERIFICATION: 'phone_verification',
  MFA_VERIFICATION: 'mfa_verification',
} as const;

// MFA Methods
export const MFA_METHOD = {
  EMAIL: 'email',
  PHONE: 'phone',
  TOTP: 'totp',
} as const;

// User Types
export const USER_TYPE = {
  USER: 'user',
  AGENCY: 'agency',
  ADMIN: 'admin',
} as const;

// OAuth Providers
export const OAUTH_PROVIDER = {
  GOOGLE: 'google',
  GITHUB: 'github',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAYMENT: 'PAYMENT',
  WAITING: 'WAITING',
  WORKING: 'WORKING',
  STOPPED: 'STOPPED',
  COMPLETE: 'COMPLETE',
  DELIVERY: 'DELIVERY',
  REFUND: 'REFUND',
  CANCEL: 'CANCEL',
} as const;

// Transaction Status
export const TRANSACTION_STATUS = {
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
  UNACCEPTABLE: 'UNACCEPTABLE',
} as const;

// Payment Methods
export const PAYMENT_METHOD = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
} as const;

// Currency Codes
export const CURRENCY = {
  USD: 'USD',
  BDT: 'BDT',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
} as const;

// Gender Options
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const;

// Government ID Types
export const GOVERNMENT_ID_TYPE = {
  NID: 'NID',
  PASSPORT: 'PASSPORT',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
} as const;

// Employee Ranges
export const EMPLOYEE_RANGE = {
  '01-30': '01-30',
  '30-70': '30-70',
  '70-150': '70-150',
  '150-300': '150-300',
  '300-500': '300-500',
  '500-700': '500-700',
  '700-1000+': '700-1000+',
} as const;

// Agency Grades
export const AGENCY_GRADE = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = {
  ENGLISH: 'English',
  HINDI: 'Hindi',
  BENGALI: 'Bengali',
  SPANISH: 'Spanish',
  FRENCH: 'French',
  GERMAN: 'German',
  CHINESE: 'Chinese',
  JAPANESE: 'Japanese',
} as const;

// Priority Levels
export const PRIORITY_LEVEL = {
  LOW: 'Low Priority',
  NORMAL: 'Normal',
  MEDIUM: 'Medium',
  HIGH: 'High Priority',
} as const;

// Project Types
export const PROJECT_TYPE = {
  PERSONAL: 'Personal',
  COMPANY: 'Company',
  CLIENT: 'Client',
  NON_PROFIT: 'Non-Profit',
  GOVERNMENT: 'Government',
  COLLABORATION: 'Collaboration',
  DEVELOPMENTAL: 'Developmental',
} as const;
