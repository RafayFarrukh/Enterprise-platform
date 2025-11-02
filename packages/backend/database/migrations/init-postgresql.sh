#!/bin/bash
set -e

echo "Creating multiple PostgreSQL databases..."

# Wait for PostgreSQL to be ready
until psql -U "$POSTGRES_USER" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

# Function to create database if it doesn't exist
create_database() {
    local db_name=$1
    echo "Creating database: $db_name"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
        SELECT 'CREATE DATABASE $db_name'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db_name')\gexec
EOSQL
}

# Create all three databases for the Enterprise Platform
create_database enterprise_sso
create_database enterprise_users
create_database enterprise_agencies

echo "PostgreSQL databases created successfully!"
echo "Databases ready: enterprise_sso, enterprise_users, enterprise_agencies"

