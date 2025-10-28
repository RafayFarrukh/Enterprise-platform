// User Types
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'DORMANT' | 'CLOSED';
export type AgencyStatus = 'PENDING' | 'INACTIVE' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'DORMANT' | 'CLOSED';
export type BusinessType = 'TECHNICAL' | 'CONSTRUCTION' | 'REAL_ESTATE' | 'COMMERCIAL_INDUSTRIAL' | 'VISA_TRAVEL' | 'IMPORT_EXPORT' | 'SOLUTIONS';
export type UserType = 'user' | 'agency' | 'admin';
export type OtpType = 'login' | 'registration' | 'password_reset' | 'email_verification' | 'phone_verification' | 'mfa_verification';
export type MfaMethod = 'email' | 'phone' | 'totp';
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'linkedin';

// Order Types
export type OrderStatus = 'PENDING' | 'PAYMENT' | 'WAITING' | 'WORKING' | 'STOPPED' | 'COMPLETE' | 'DELIVERY' | 'REFUND' | 'CANCEL';
export type TransactionStatus = 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'DISPUTED' | 'UNACCEPTABLE';
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'cash';

// Currency Types
export type Currency = 'USD' | 'BDT' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

// Gender Types
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

// Government ID Types
export type GovernmentIdType = 'NID' | 'PASSPORT' | 'DRIVING_LICENSE';

// Employee Range Types
export type EmployeeRange = '01-30' | '30-70' | '70-150' | '150-300' | '300-500' | '500-700' | '700-1000+';

// Agency Grade Types
export type AgencyGrade = 'A' | 'B' | 'C' | 'D' | 'E';

// Priority Level Types
export type PriorityLevel = 'Low Priority' | 'Normal' | 'Medium' | 'High Priority';

// Project Type Types
export type ProjectType = 'Personal' | 'Company' | 'Client' | 'Non-Profit' | 'Government' | 'Collaboration' | 'Developmental';

// JWT Token Types
export type TokenType = 'access' | 'refresh';

// API Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

// Sort Order Types
export type SortOrder = 'asc' | 'desc';

// Environment Types
export type Environment = 'development' | 'staging' | 'production' | 'test';

// Log Level Types
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

// Database Provider Types
export type DatabaseProvider = 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';

// Cache Provider Types
export type CacheProvider = 'redis' | 'memory' | 'memcached';

// File Upload Types
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'svg';
export type DocumentFormat = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt';

// Notification Types
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Security Types
export type EncryptionAlgorithm = 'aes-256-gcm' | 'aes-256-cbc' | 'rsa-2048' | 'rsa-4096';
export type HashAlgorithm = 'sha256' | 'sha512' | 'bcrypt' | 'argon2';

// Rate Limiting Types
export type RateLimitWindow = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';

// Validation Types
export type ValidationRule = 'required' | 'email' | 'phone' | 'url' | 'uuid' | 'date' | 'number' | 'string' | 'boolean' | 'array' | 'object';

// Permission Types
export type Permission = 'read' | 'write' | 'delete' | 'admin' | 'moderate' | 'create' | 'update';

// Role Types
export type Role = 'super_admin' | 'admin' | 'moderator' | 'user' | 'agency' | 'guest';

// Audit Action Types
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'password_change' | 'profile_update' | 'permission_change';

// Webhook Event Types
export type WebhookEvent = 'user.created' | 'user.updated' | 'user.deleted' | 'order.created' | 'order.updated' | 'payment.succeeded' | 'payment.failed';

// Error Types
export type ErrorCode = 'VALIDATION_ERROR' | 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMITED' | 'INTERNAL_ERROR' | 'EXTERNAL_SERVICE_ERROR';

// Configuration Types
export type ConfigKey = 'database' | 'redis' | 'jwt' | 'email' | 'oauth' | 'storage' | 'payment' | 'notification';

// Service Types
export type ServiceName = 'auth-service' | 'user-service' | 'agency-service' | 'order-service' | 'chat-service' | 'notification-service' | 'file-service' | 'payment-service';

// API Version Types
export type ApiVersion = 'v1' | 'v2' | 'v3';

// Language Types
export type Language = 'en' | 'bn' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'hi' | 'pt' | 'ru';

// Timezone Types
export type Timezone = 'UTC' | 'America/New_York' | 'America/Los_Angeles' | 'Europe/London' | 'Europe/Paris' | 'Asia/Dhaka' | 'Asia/Tokyo' | 'Asia/Shanghai' | 'Australia/Sydney';

// Status Code Types
export type StatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503 | 504;
