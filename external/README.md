# External Services for Local Development

This folder contains the external services (PostgreSQL, PostgREST) needed for local development of the Task Tracker application.

## 🚀 Quick Start

```bash
# Start local development services
cd external
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs
```

## 📊 Services

- **PostgreSQL** (Port 5432): Main database
- **PostgREST** (Port 3003): Auto-generated REST API
- **PgAdmin** (Port 8080): Database admin interface (optional)

## 🔧 Configuration

The services use these default credentials:
- **Database**: tasktracker
- **User**: tasktracker_user  
- **Password**: tasktracker_password

## 🛑 Stopping Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This deletes your data!)
docker-compose down -v
```

## 🔗 API Access

Once running, your Next.js app will connect to:
- **API URL**: http://localhost:3003
- **Database**: postgresql://tasktracker_user:tasktracker_password@localhost:5432/tasktracker

## 📁 Files

- `docker-compose.yml`: Service definitions
- `database/init.sql`: Database schema and initial data
- `LOCAL_DATABASE_SETUP.md`: Detailed setup instructions
