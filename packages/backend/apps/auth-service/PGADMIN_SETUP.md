# 🗄️ pgAdmin Setup Guide

## Access pgAdmin

1. **Start the services** (including pgAdmin):
   ```bash
   docker compose up -d
   ```

2. **Open pgAdmin in your browser**:
   ```
   http://localhost:5050
   ```

3. **Login credentials**:
   - **Email**: `admin@enterprise.com`
   - **Password**: `admin`

## Connect to PostgreSQL Server

After logging in to pgAdmin:

1. **Right-click on "Servers"** → **Create** → **Server**

2. **General Tab**:
   - **Name**: `Enterprise PostgreSQL` (or any name you prefer)

3. **Connection Tab**:
   - **Host name/address**: `postgresql` (or `localhost` if connecting from outside Docker)
   - **Port**: `5432`
   - **Maintenance database**: `postgres`
   - **Username**: `postgres`
   - **Password**: `password`
   - ✅ **Save password** (optional, for convenience)

4. **Click "Save"**

## Available Databases

Once connected, you'll see these databases in pgAdmin:

- ✅ **enterprise_sso** - Authentication & Authorization Service
- ✅ **enterprise_users** - User Service (if created)
- ✅ **enterprise_agencies** - Agency Service (if created)
- ✅ **postgres** - Default PostgreSQL database

## Quick Access

- **pgAdmin URL**: http://localhost:5050
- **Login**: admin@enterprise.com / admin
- **PostgreSQL Host**: postgresql (inside Docker network) or localhost (from host)

## Change pgAdmin Credentials

To change the default email/password, edit `docker-compose.yml`:

```yaml
environment:
  - PGADMIN_DEFAULT_EMAIL=your-email@example.com
  - PGADMIN_DEFAULT_PASSWORD=your-secure-password
```

Then restart:
```bash
docker compose restart pgadmin
```

## Troubleshooting

### Cannot connect to PostgreSQL?
- Make sure PostgreSQL container is running: `docker compose ps`
- Try using `localhost` instead of `postgresql` as hostname
- Check if port 5432 is accessible

### pgAdmin not loading?
- Check if container is running: `docker compose ps pgadmin`
- View logs: `docker compose logs pgadmin`
- Restart: `docker compose restart pgadmin`

