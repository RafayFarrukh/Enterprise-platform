# SSO Authentication Service

Enterprise-grade OAuth 2.0/OIDC authentication service for the Enterprise Platform.

## Features

- **OAuth 2.0 / OpenID Connect (OIDC)** - Industry standard authentication
- **JWT with RS256** - Asymmetric encryption for tokens
- **Refresh Token Rotation** - Enhanced security
- **Multi-Factor Authentication (MFA)** - TOTP-based (Google Authenticator, Authy)
- **Social Login** - Google, GitHub, Facebook, LinkedIn
- **Session Management** - Redis-based with automatic expiration
- **Account Lockout Policy** - After 5 failed login attempts
- **Password Policy** - Minimum 12 characters, complexity requirements
- **User & Agency Support** - Separate account types
- **Email Verification** - OTP-based email verification
- **Phone Verification** - OTP-based phone verification

## Tech Stack

- **NestJS** - Enterprise Node.js framework
- **Prisma** - Database ORM
- **MySQL** - Primary database
- **Redis** - Session storage and caching
- **Passport.js** - Authentication middleware
- **JWT** - Token management
- **bcrypt** - Password hashing
- **speakeasy** - TOTP for MFA
- **QRCode** - MFA QR code generation

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis 7+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd packages/backend/apps/auth-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Start MySQL and Redis
   docker-compose up -d mysql redis
   
   # Run database migrations
   npx prisma migrate dev
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the service**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f auth-service

# Stop services
docker-compose down
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register/user` - Register new user
- `POST /api/v1/auth/register/agency` - Register new agency
- `POST /api/v1/auth/login` - Login user/agency
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user/agency
- `GET /api/v1/auth/profile` - Get user profile
- `GET /api/v1/auth/profile/agency` - Get agency profile

### MFA (Multi-Factor Authentication)

- `POST /api/v1/auth/mfa/enable` - Enable MFA
- `POST /api/v1/auth/mfa/verify` - Verify MFA setup
- `POST /api/v1/auth/mfa/disable` - Disable MFA
- `POST /api/v1/auth/mfa/backup-codes/generate` - Generate backup codes
- `GET /api/v1/auth/mfa/backup-codes` - Get backup codes

### Password Management

- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password

### Email Verification

- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email

### OAuth 2.0 / OIDC

- `GET /api/v1/oauth/google` - Google OAuth login
- `GET /api/v1/oauth/google/callback` - Google OAuth callback
- `GET /api/v1/oauth/github` - GitHub OAuth login
- `GET /api/v1/oauth/github/callback` - GitHub OAuth callback
- `GET /api/v1/oauth/authorize` - OAuth 2.0 authorization endpoint
- `POST /api/v1/oauth/token` - OAuth 2.0 token endpoint
- `GET /api/v1/oauth/userinfo` - OIDC UserInfo endpoint
- `GET /api/v1/oauth/.well-known/openid_configuration` - OIDC Discovery
- `GET /api/v1/oauth/jwks` - JSON Web Key Set

## Configuration

### Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL="mysql://root:password@localhost:3306/enterprise_sso"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@enterprise-platform.com

# Security
ENCRYPTION_KEY=your-encryption-key-for-sensitive-data
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# MFA
MFA_ISSUER=Enterprise Platform
MFA_ALGORITHM=sha1
MFA_DIGITS=6
MFA_PERIOD=30
```

## Database Schema

The service uses Prisma with MySQL. Key models include:

- **User** - User accounts with profiles and preferences
- **Agency** - Agency accounts with business information
- **UserSession/AgencySession** - Session management
- **SocialAccount** - Social login accounts
- **MfaBackupCode** - MFA backup codes
- **OAuthClient** - OAuth 2.0 clients
- **OAuthToken** - OAuth 2.0 tokens

## Security Features

- **Password Hashing** - bcrypt with cost factor 12
- **JWT Security** - RS256 algorithm with refresh token rotation
- **Rate Limiting** - API rate limiting with Redis
- **Account Lockout** - Automatic lockout after failed attempts
- **MFA Support** - TOTP with backup codes
- **Session Management** - Secure session handling
- **Input Validation** - Comprehensive DTO validation
- **CORS Protection** - Configurable CORS settings

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Management

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Docker Production

```bash
docker build -t auth-service .
docker run -p 3001:3001 auth-service
```

## API Documentation

Once the service is running, visit:
- **Swagger UI**: http://localhost:3001/api/v1/docs
- **OIDC Discovery**: http://localhost:3001/api/v1/oauth/.well-known/openid_configuration

## Support

For issues and questions:
1. Check the API documentation
2. Review the logs
3. Check database connectivity
4. Verify environment variables

## License

This project is licensed under the MIT License.
