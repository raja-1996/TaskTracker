# Local Database Setup Guide

This guide will help you set up a local PostgreSQL database using Docker to bypass network connectivity issues with remote Supabase.

## 🐳 Prerequisites

- **Docker** and **Docker Compose** installed on your system
- **Node.js** and **npm** (already set up)

## 🚀 Quick Start

### 1. Start the Local Database

```bash
# Start PostgreSQL with PostgREST API
docker-compose up -d

# Check that services are running
docker-compose ps
```

### 2. Verify Database Setup

```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Check PostgREST API is running
docker-compose logs postgrest

# Test API endpoint
curl http://localhost:3003/projects
```

### 3. Start the Application

```bash
# Start Next.js development server (in a new terminal)
npm run dev
```

Your app will now use the local database at `http://localhost:3003` instead of remote Supabase!

## 📊 Database Services

| Service | URL | Purpose |
|---------|-----|---------|
| **PostgreSQL** | `localhost:5432` | Main database |
| **PostgREST API** | `http://localhost:3003` | REST API for database |
| **PgAdmin** (optional) | `http://localhost:8080` | Database admin interface |

## 🔧 Configuration

### Environment Variables

The application automatically switches to local mode with these settings in `.env.local`:

```bash
NEXT_PUBLIC_USE_LOCAL_DB=true
NEXT_PUBLIC_LOCAL_SUPABASE_URL=http://localhost:3003
NEXT_PUBLIC_LOCAL_SUPABASE_ANON_KEY=local-development-key
```

### Database Connection Details

```
Host: localhost
Port: 5432
Database: tasktracker
User: tasktracker_user
Password: tasktracker_password
```

## 📁 Sample Data

The database comes pre-loaded with sample data including:

- **3 Projects** (including archived ones)
- **5 Tasks** across different projects
- **6 Subtasks** with various statuses
- **Sample descriptions** and **comments**

## 🛠 Management Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove data (fresh start)
docker-compose down -v

# View logs
docker-compose logs -f [service_name]
```

### Database Access

#### Using Docker CLI

```bash
# Connect to PostgreSQL directly
docker-compose exec postgres psql -U tasktracker_user -d tasktracker

# Run SQL commands
docker-compose exec postgres psql -U tasktracker_user -d tasktracker -c "SELECT * FROM projects;"
```

#### Using PgAdmin (Optional)

```bash
# Start with admin interface
docker-compose --profile admin up -d

# Access at: http://localhost:8080
# Email: admin@tasktracker.local
# Password: admin_password
```

## 🔄 API Testing

### Test PostgREST Endpoints

```bash
# Get all projects
curl http://localhost:3003/projects

# Get specific project
curl http://localhost:3003/projects?id=eq.550e8400-e29b-41d4-a716-446655440000

# Get tasks for a project
curl http://localhost:3003/tasks?project_id=eq.550e8400-e29b-41d4-a716-446655440000

# Create a new project (POST)
curl -X POST http://localhost:3003/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","status":"Active"}'
```

## 🔄 Switch Between Local/Remote

### Use Local Database

```bash
# In .env.local
NEXT_PUBLIC_USE_LOCAL_DB=true
```

### Use Remote Supabase

```bash
# In .env.local
NEXT_PUBLIC_USE_LOCAL_DB=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🐛 Troubleshooting

### Port Conflicts

If port 3003 is in use, update `docker-compose.yml`:

```yaml
postgrest:
  ports:
    - "3002:3000"  # Change to available port
```

Then update `.env.local`:
```bash
NEXT_PUBLIC_LOCAL_SUPABASE_URL=http://localhost:3002
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Restart services
docker-compose restart

# Fresh start (removes all data)
docker-compose down -v && docker-compose up -d
```

### API Not Working

```bash
# Check PostgREST logs
docker-compose logs postgrest

# Test direct connection
curl -v http://localhost:3003/projects
```

## 🎯 Benefits of Local Setup

- ✅ **No Network Issues** - Everything runs locally
- ✅ **Fast Development** - No latency or timeouts
- ✅ **Full Control** - Modify schema and data freely
- ✅ **Offline Development** - Works without internet
- ✅ **Corporate Network Friendly** - Bypasses firewall restrictions
- ✅ **Consistent Environment** - Same for all developers

## 🚀 Production Deployment

When ready for production, simply switch back to remote Supabase by updating `.env.local`:

```bash
NEXT_PUBLIC_USE_LOCAL_DB=false
# Uncomment your Supabase credentials
```

Your application code remains unchanged! 🎉
