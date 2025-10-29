export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3001,
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  },
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/enterprise_sso',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key-change-this-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@enterprise-platform.com',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 's3',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      bucket: process.env.AWS_S3_BUCKET || 'enterprise-platform-storage',
      region: process.env.AWS_REGION || 'us-east-1',
    },
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-for-sensitive-data',
    rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '15m',
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
  mfa: {
    issuer: process.env.MFA_ISSUER || 'Enterprise Platform',
    algorithm: process.env.MFA_ALGORITHM || 'sha1',
    digits: parseInt(process.env.MFA_DIGITS) || 6,
    period: parseInt(process.env.MFA_PERIOD) || 30,
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    expiresIn: process.env.SESSION_EXPIRES_IN || '7d',
  },
});
