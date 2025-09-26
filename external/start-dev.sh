#!/bin/bash

# Local Development Services Starter
set -e

echo "🚀 Starting Task Tracker local development services..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
print_status "Starting external services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to initialize..."
sleep 10

# Check service health
print_status "Checking service status..."
docker-compose ps

echo
print_info "Services are ready!"
echo
echo "📊 Available Services:"
echo "   PostgreSQL: localhost:5432"
echo "   PostgREST API: http://localhost:3003"
echo "   PgAdmin: http://localhost:8080 (admin@tasktracker.local / admin_password)"
echo
echo "🔧 Next steps:"
echo "   1. Go back to project root: cd .."
echo "   2. Start your Next.js app: npm run dev"
echo
echo "🛑 To stop services: docker-compose down"
