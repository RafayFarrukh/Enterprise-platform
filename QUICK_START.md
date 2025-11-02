# 🚀 Quick Start - Step by Step

## ✅ Correct Order:

### **1. Start PostgreSQL First** 
```bash
cd /Users/mac/Documents/Enterprise-platform

# Start only PostgreSQL
docker compose -f docker-compose.hybrid.yml up -d postgresql

# OR use the local docker-compose in auth-service
cd packages/backend/apps/auth-service
docker compose up -d postgresql
```

Wait 10-15 seconds for PostgreSQL to initialize.

### **2. Update .env File**
Make sure your `.env` file has PostgreSQL connection:
```bash
cd packages/backend/apps/auth-service

# Update DATABASE_URL to PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/enterprise_sso"

# Update REDIS_PORT if using Docker Redis (port 6380)
REDIS_PORT=6380  # or 6379 if using local Redis
```

### **3. Run Prisma Generate & Migrations**
```bash
cd packages/backend/apps/auth-service

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### **4. Start Backend Service**
```bash
cd packages/backend/apps/auth-service

# Option A: Via npm (development)
npm run start:dev

# Option B: Via Docker
docker compose up -d
```

---

## ⚠️ **Port Conflicts Fixed:**

- **PostgreSQL**: Port 5432 (standard)
- **Redis**: Port 6380 (changed from 6379 to avoid local Redis conflict)
- **MongoDB**: Port 27017 (standard)

---

## 🔧 **If You Have Local Redis Running:**

You have two options:

### **Option A: Use Docker Redis (Recommended)**
Update `.env`:
```
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=password
```

### **Option B: Use Local Redis**
Keep your local Redis running and use:
```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Your local Redis password (if any)
```

---

## ✅ **Dependency Injection Fixed:**

The `SecurityService` dependency issue has been fixed by importing `AuthModule` in `OAuthModule`.

