# 🚀 Quick Start Guide - Enterprise Platform

## 📍 **Starting Directory**

**Start from the ROOT directory:**
```bash
cd /Users/mac/Documents/Enterprise-platform
```

This is where `docker-compose.hybrid.yml` is located.

---

## ✅ **Database Confirmation**

**YES - PostgreSQL 18.0 is your MAIN database!**

- **PostgreSQL 18.0+** → Primary database (users, products, orders, payments)
  - `enterprise_sso` (Authentication)
  - `enterprise_users` (User data)
  - `enterprise_agencies` (Agency data)

- **MongoDB 7.0+** → Chat messages & conversations
  - `enterprise_chat`

- **Redis 7.2+** → Cache, sessions, cart data

---

## 🐳 **Starting with Docker (Recommended)**

### **Option 1: Start ALL services (PostgreSQL + MongoDB + Redis + Services)**

```bash
# From root directory
cd /Users/mac/Documents/Enterprise-platform

# Start everything
docker-compose -f docker-compose.hybrid.yml up -d

# View logs
docker-compose -f docker-compose.hybrid.yml logs -f

# Stop everything
docker-compose -f docker-compose.hybrid.yml down
```

### **Option 2: Start ONLY databases (PostgreSQL + MongoDB + Redis)**

```bash
# Start only database services
docker-compose -f docker-compose.hybrid.yml up -d postgresql mongodb redis

# Check status
docker-compose -f docker-compose.hybrid.yml ps

# View database logs
docker-compose -f docker-compose.hybrid.yml logs -f postgresql
```

---

## 📊 **Database Connection Info**

### PostgreSQL (Main Database)
```
Host: localhost (or postgresql if connecting from another container)
Port: 5432
User: postgres
Password: password
Databases:
  - enterprise_sso
  - enterprise_users
  - enterprise_agencies
```

### MongoDB
```
Host: localhost (or mongodb if connecting from another container)
Port: 27017
User: root
Password: password
Database: enterprise_chat
```

### Redis
```
Host: localhost (or redis if connecting from another container)
Port: 6379
Password: password
```

---

## 🔧 **Setup Steps (First Time)**

### 1. **Start Databases**
```bash
docker-compose -f docker-compose.hybrid.yml up -d postgresql mongodb redis
```

### 2. **Wait for PostgreSQL to initialize** (takes ~10-15 seconds)
```bash
# Check if PostgreSQL is ready
docker-compose -f docker-compose.hybrid.yml exec postgresql pg_isready -U postgres
```

### 3. **Run Prisma Migrations** (for auth-service)
```bash
cd packages/backend/apps/auth-service

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. **Start Auth Service**
```bash
# Option A: Via Docker (recommended)
cd /Users/mac/Documents/Enterprise-platform
docker-compose -f docker-compose.hybrid.yml up -d auth-service

# Option B: Via npm (development)
cd packages/backend/apps/auth-service
npm install
npm run start:dev
```

---

## 🎯 **Verify Everything is Running**

```bash
# Check all running containers
docker-compose -f docker-compose.hybrid.yml ps

# Should show:
# - enterprise-postgresql (healthy)
# - enterprise-mongodb (healthy)
# - enterprise-redis (healthy)
# - enterprise-auth-service (if started)
```

---

## 🌐 **Service URLs**

After starting services:

- **Auth Service**: http://localhost:3001/api/v1
- **Swagger Docs**: http://localhost:3001/api/v1/docs
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

---

## ⚠️ **Common Issues**

### PostgreSQL not starting?
```bash
# Check logs
docker-compose -f docker-compose.hybrid.yml logs postgresql

# Remove volumes and restart (WARNING: deletes data)
docker-compose -f docker-compose.hybrid.yml down -v
docker-compose -f docker-compose.hybrid.yml up -d postgresql
```

### Cannot connect to PostgreSQL?
```bash
# Test connection
docker-compose -f docker-compose.hybrid.yml exec postgresql psql -U postgres -l

# You should see all 3 databases: enterprise_sso, enterprise_users, enterprise_agencies
```

### Port already in use?
```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB
lsof -i :6379  # Redis

# Stop conflicting services or change ports in docker-compose.hybrid.yml
```

---

## 📝 **Quick Commands Reference**

```bash
# Start everything
docker-compose -f docker-compose.hybrid.yml up -d

# Start specific service
docker-compose -f docker-compose.hybrid.yml up -d postgresql

# View logs
docker-compose -f docker-compose.hybrid.yml logs -f [service-name]

# Stop everything
docker-compose -f docker-compose.hybrid.yml down

# Stop and remove volumes (deletes data)
docker-compose -f docker-compose.hybrid.yml down -v

# Restart a service
docker-compose -f docker-compose.hybrid.yml restart postgresql

# Check service health
docker-compose -f docker-compose.hybrid.yml ps
```

---

## ✅ **Yes - PostgreSQL Runs in Docker!**

All databases are containerized:
- ✅ PostgreSQL 18.0 in Docker
- ✅ MongoDB 7.0 in Docker  
- ✅ Redis 7.2 in Docker

No need to install them locally! 🎉

