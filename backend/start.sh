#!/bin/bash

echo "🚀 Starting Enterprise Platform Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is running (optional)
echo "🗄️  Make sure your MySQL database is running on localhost:3306"
echo "   You can start it with: docker-compose up mysql -d"

# Start the development server
echo "🎯 Starting development server..."
npm run start:dev
