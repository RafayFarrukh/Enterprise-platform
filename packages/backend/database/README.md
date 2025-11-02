# Database Setup

This directory contains database initialization scripts and migrations.

## Databases Configured

### PostgreSQL 18.0+ (Primary Data)
- **enterprise_sso** - Authentication & Authorization Service (users, agencies, roles, permissions)
- **enterprise_users** - User Service (user profiles, preferences)
- **enterprise_agencies** - Agency Service (agency profiles, business data)

### MongoDB 7.0+ (Chat & Conversations)
- **enterprise_chat** - Chat messages, conversations, real-time data

### Redis 7.2+ (Cache & Sessions)
- **Cache** - Frequently accessed data
- **Sessions** - User/agency session storage
- **Cart Data** - Shopping cart data (when implemented)

## Initialization

The databases are automatically initialized when Docker containers start:

1. **PostgreSQL**: The `init-postgresql.sh` script creates the three databases on container startup
2. **MongoDB**: Auto-creates the `enterprise_chat` database on first connection
3. **Redis**: Ready to use immediately with password authentication

## Connection Strings

### PostgreSQL
```
postgresql://postgres:password@localhost:5432/enterprise_sso
postgresql://postgres:password@localhost:5432/enterprise_users
postgresql://postgres:password@localhost:5432/enterprise_agencies
```

### MongoDB
```
mongodb://root:password@localhost:27017/enterprise_chat?authSource=admin
```

### Redis
```
redis://:password@localhost:6379
```

## Running Migrations

After starting the databases, run Prisma migrations:

```bash
# For auth-service
cd packages/backend/apps/auth-service
npx prisma migrate dev
npx prisma generate
```

## Health Checks

All databases have health checks configured:
- PostgreSQL: `pg_isready`
- MongoDB: `mongosh ping`
- Redis: `redis-cli ping`

