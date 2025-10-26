# 🚀 Complete Enterprise Platform Setup Guide

## 📋 Overview
This guide will walk you through setting up the entire Enterprise Platform with NestJS authentication module from scratch, including database setup, environment configuration, and running the application.

## 🎯 Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ (or Docker)
- Git
- VS Code (recommended)

---

## 📁 Step 1: Project Structure Setup

### 1.1 Create the main project directory
```bash
mkdir enterprise-platform
cd enterprise-platform
```

### 1.2 Create the backend directory structure
```bash
mkdir -p backend/src/{modules/auth/{controllers,services,strategies,guards,decorators,entities,dto},config,database,common}
mkdir -p backend/{prisma,test/unit}
mkdir -p infrastructure/{docker,nginx,scripts}
mkdir -p docs/{architecture,api,deployment,security}
```

---

## 🏗️ Step 2: Initialize NestJS Project

### 2.1 Create a new NestJS project
```bash
cd backend
npx @nestjs/cli new . --package-manager npm --skip-git
```

### 2.2 Install additional dependencies
```bash
# Core dependencies
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger
npm install passport passport-jwt passport-local passport-google-oauth20 passport-github2
npm install @prisma/client prisma
npm install bcrypt class-validator class-transformer
npm install nodemailer speakeasy qrcode uuid

# Development dependencies
npm install --save-dev @types/bcrypt @types/passport-jwt @types/passport-local
npm install --save-dev @types/nodemailer @types/speakeasy @types/qrcode @types/uuid
npm install --save-dev @types/passport-google-oauth20 @types/passport-github2
```

---

## 🗄️ Step 3: Database Setup

### 3.1 Initialize Prisma
```bash
npx prisma init
```

### 3.2 Create the Prisma schema
Create `prisma/schema.prisma`:
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String?
  name        String
  role        UserRole @default(USER)
  isVerified  Boolean  @default(false)
  mfaSecret   String?
  mfaEnabled  Boolean  @default(false)
  avatar      String?
  phone       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  sessions    Session[]
  otpTokens   OtpToken[]
  oauthAccounts OAuthAccount[]

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model OtpToken {
  id        String    @id @default(cuid())
  userId    String
  token     String
  type      OtpType
  expiresAt DateTime
  createdAt DateTime  @default(now())
  used      Boolean   @default(false)

  // Relations
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("otp_tokens")
}

model OAuthAccount {
  id            String   @id @default(cuid())
  userId        String
  provider      String
  providerId    String
  accessToken   String?
  refreshToken  String?
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("oauth_accounts")
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum OtpType {
  SIGNUP
  PASSWORD_RESET
  EMAIL_VERIFICATION
  MFA_SETUP
}
```

### 3.3 Set up environment variables
Create `.env` file:
```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/enterprise_platform"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production-67890"
JWT_REFRESH_EXPIRES_IN="7d"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/v1/auth/oauth/google/callback"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@enterprise-platform.com"

# Application Configuration
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"
FRONTEND_URL="http://localhost:3001"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Security Configuration
BCRYPT_ROUNDS=12
OTP_EXPIRES_IN=300000
SESSION_EXPIRES_IN=604800000
```

---

## 🏗️ Step 4: Copy Authentication Module Files

### 4.1 Copy Configuration Files
Copy these files to `src/config/`:
- `database.config.ts`
- `jwt.config.ts`
- `email.config.ts`
- `oauth.config.ts`
- `redis.config.ts`
- `storage.config.ts`

### 4.2 Copy Database Service
Copy `src/database/prisma.service.ts`

### 4.3 Copy Authentication Module
Copy the entire `src/modules/auth/` directory with all subdirectories:
- `controllers/` (auth.controller.ts, oauth.controller.ts)
- `services/` (auth.service.ts, jwt.service.ts, mfa.service.ts, oauth.service.ts)
- `strategies/` (jwt.strategy.ts, local.strategy.ts, google.strategy.ts, github.strategy.ts)
- `guards/` (jwt-auth.guard.ts, roles.guard.ts, mfa.guard.ts)
- `decorators/` (current-user.decorator.ts, roles.decorator.ts, public.decorator.ts)
- `entities/` (user.entity.ts, session.entity.ts, oauth-client.entity.ts)
- `dto/` (login.dto.ts, register.dto.ts, verify-otp.dto.ts, mfa.dto.ts)
- `auth.module.ts`

### 4.4 Update Main Application Files
Update `src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import oauthConfig from './config/oauth.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        emailConfig,
        oauthConfig,
        redisConfig,
        storageConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

Update `src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // API prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Enterprise Platform API')
    .setDescription('Enterprise Platform Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
```

---

## 🗄️ Step 5: Database Setup

### 5.1 Start MySQL Database
**Option A: Using Docker (Recommended)**
```bash
# Create docker-compose.yml in project root
docker-compose up mysql -d
```

**Option B: Local MySQL**
- Install MySQL 8.0
- Create database: `enterprise_platform`
- Update DATABASE_URL in .env

### 5.2 Generate Prisma Client
```bash
npx prisma generate
```

### 5.3 Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 5.4 Seed Database (Optional)
Create `prisma/seed.ts` and run:
```bash
npm run prisma:seed
```

---

## 🧪 Step 6: Testing Setup

### 6.1 Copy Test Files
Copy `test/unit/auth.service.spec.ts`

### 6.2 Update package.json scripts
Add these scripts to `package.json`:
```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 🐳 Step 7: Docker Setup (Optional)

### 7.1 Create Dockerfile
Create `Dockerfile` in backend directory

### 7.2 Create docker-compose.yml
Create `docker-compose.yml` in project root

### 7.3 Create nginx configuration
Create `infrastructure/nginx/nginx.conf`

---

## 🚀 Step 8: Run the Application

### 8.1 Install dependencies
```bash
npm install
```

### 8.2 Start the development server
```bash
npm run start:dev
```

### 8.3 Access the application
- **API**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/api/v1/auth/profile

---

## 🧪 Step 9: Test the API

### 9.1 Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

### 9.2 Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## 📋 Step 10: VS Code Live Share Setup

### 10.1 Install VS Code Extensions
- Live Share
- Prisma
- TypeScript Importer
- REST Client (for API testing)

### 10.2 Create VS Code settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "prisma.showPrismaDataPlatformNotification": false
}
```

### 10.3 Create launch configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

---

## 🎯 Quick Commands Summary

```bash
# 1. Create project
mkdir enterprise-platform && cd enterprise-platform

# 2. Setup NestJS
mkdir backend && cd backend
npx @nestjs/cli new . --package-manager npm --skip-git

# 3. Install dependencies
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger
npm install passport passport-jwt passport-local passport-google-oauth20 passport-github2
npm install @prisma/client prisma bcrypt class-validator class-transformer
npm install nodemailer speakeasy qrcode uuid

# 4. Setup Prisma
npx prisma init

# 5. Copy all authentication module files (from our created files)

# 6. Setup database
docker-compose up mysql -d
npx prisma generate
npx prisma migrate dev --name init

# 7. Start application
npm run start:dev
```

---

## 🆘 Troubleshooting

### Common Issues:
1. **Module not found**: Make sure all files are copied correctly
2. **Database connection**: Check DATABASE_URL in .env
3. **Port conflicts**: Change PORT in .env
4. **Prisma errors**: Run `npx prisma generate` after schema changes

### Reset Everything:
```bash
# Stop services
docker-compose down

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
npx prisma generate
npx prisma migrate dev
```

---

## 🎉 Success!
Your Enterprise Platform with NestJS authentication module is now ready! 

**Next Steps:**
1. Copy all the authentication module files we created
2. Follow the steps above
3. Start coding with your team on VS Code Live Share!

**API Documentation**: http://localhost:3000/api/v1/docs
