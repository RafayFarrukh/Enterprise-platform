# 🚀 Quick Start Guide - Enterprise Platform Backend

## ✅ Packages Installed Successfully!

All the required packages have been installed and the project is ready to run.

## 🎯 Next Steps

### 1. Set up Environment Variables
```bash
cd backend
cp env.example .env
# Edit .env with your database and service credentials
```

### 2. Start Database (Choose one option)

**Option A: Using Docker (Recommended)**
```bash
# Start MySQL and Redis
docker-compose up mysql redis -d
```

**Option B: Local MySQL**
- Install MySQL 8.0 locally
- Create database: `enterprise_platform`
- Update DATABASE_URL in .env

### 3. Run Database Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Seed Database (Optional)
```bash
npm run prisma:seed
```

### 5. Start the Application
```bash
# Option 1: Use the startup script
./start.sh

# Option 2: Manual start
npm run start:dev
```

## 🌐 Access Points

- **API**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/api/v1/auth/profile

## 🧪 Test the API

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

## 🔧 Available Scripts

```bash
npm run start:dev     # Start development server
npm run build         # Build for production
npm run start:prod    # Start production server
npm test              # Run tests
npm run lint          # Run linter
npm run prisma:studio # Open Prisma Studio
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start only database services
docker-compose up mysql redis -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

## 📋 Default Test Accounts (after seeding)

- **Admin**: admin@enterprise-platform.com / AdminPassword123!
- **User**: user@enterprise-platform.com / UserPassword123!
- **Moderator**: moderator@enterprise-platform.com / ModeratorPassword123!

## 🆘 Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**: ✅ **FIXED** - All packages are now installed
2. **Database connection errors**: Make sure MySQL is running and DATABASE_URL is correct
3. **Port already in use**: Change PORT in .env or kill the process using port 3000

### Reset Everything:
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Reinstall packages
rm -rf node_modules package-lock.json
npm install

# Restart
docker-compose up -d
npx prisma migrate dev
```

---

**🎉 Your authentication module is ready to use!**
