# Enterprise Platform Backend

A comprehensive NestJS authentication module for the Enterprise Platform monolithic backend.

## Features

- 🔐 **Local Authentication** - Email/password registration and login
- 🌐 **OAuth Integration** - Google and GitHub OAuth2 login
- 🎫 **JWT Tokens** - Access and refresh token management
- 📧 **Email Verification** - OTP-based email verification
- 🔒 **Two-Factor Authentication** - TOTP-based MFA using authenticator apps
- 👥 **Role-Based Access Control** - Admin, User, Moderator roles
- 🔄 **Password Reset** - Email OTP-based password reset
- 📱 **Session Management** - Secure session tracking with refresh tokens
- 🛡️ **Security Features** - bcrypt password hashing, input validation

## Tech Stack

- **Framework**: NestJS (latest)
- **Database**: MySQL with Prisma ORM
- **Authentication**: Passport.js with JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   └── auth/                 # Authentication Module
│   │       ├── controllers/      # API endpoints
│   │       ├── services/         # Business logic
│   │       ├── strategies/       # Passport strategies
│   │       ├── guards/           # Route guards
│   │       ├── decorators/       # Custom decorators
│   │       ├── entities/         # TypeScript entities
│   │       ├── dto/              # Data transfer objects
│   │       └── auth.module.ts    # Module definition
│   ├── config/                   # Configuration files
│   ├── database/                 # Database service
│   ├── main.ts                   # Application entry point
│   └── app.module.ts             # Root module
├── prisma/                       # Database schema and migrations
├── test/                         # Test files
├── Dockerfile                    # Container configuration
└── package.json                  # Dependencies
```

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Docker (optional)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npm run prisma:seed
   ```

4. **Start the development server:**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api/v1`

### Docker Setup

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api/v1/docs`
- **API Base URL**: `http://localhost:3000/api/v1`

## Authentication Endpoints

### Public Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - Verify OTP token
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/refresh` - Refresh access token
- `GET /auth/oauth/google` - Google OAuth login
- `GET /auth/oauth/github` - GitHub OAuth login

### Protected Endpoints
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout user
- `POST /auth/logout-all` - Logout from all devices
- `POST /auth/mfa/setup` - Setup MFA
- `POST /auth/mfa/enable` - Enable MFA
- `POST /auth/mfa/disable` - Disable MFA
- `POST /auth/mfa/verify` - Verify MFA token

## Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/enterprise_platform"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key"
JWT_REFRESH_EXPIRES_IN="7d"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/v1/auth/oauth/google/callback"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@enterprise-platform.com"

# Application
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"
FRONTEND_URL="http://localhost:3001"
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Schema

The authentication module uses the following main entities:

- **User**: Core user information with roles and MFA settings
- **Session**: Active user sessions with refresh tokens
- **OtpToken**: OTP tokens for email verification and password reset
- **OAuthAccount**: Linked OAuth provider accounts

## Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Security**: Separate secrets for access and refresh tokens
- **Rate Limiting**: Configurable rate limits for auth endpoints
- **Input Validation**: Comprehensive DTO validation
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: XSS, CSRF, and other security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
