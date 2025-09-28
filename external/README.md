# External Services for Local Development

This folder contains the external services (PostgreSQL, PostgREST) needed for local development of the Task Tracker application.

## 🚀 Quick Start

```bash
# First, set up environment variables
cd external
cp .env.example .env
# Edit .env with your secure values

# Start local development services
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

### 🔒 Required Configuration
You **must** create a `.env` file with all required environment variables:

```bash
# Copy the example file
cp .env.example .env

# Edit with your secure values
nano .env
```

**Example `.env` file**:
```bash
POSTGRES_DB=tasktracker
POSTGRES_USER=your_secure_user
POSTGRES_PASSWORD=your-very-secure-password-here
PGRST_JWT_SECRET=your-jwt-secret-at-least-32-characters-long
PGADMIN_DEFAULT_EMAIL=your-email@domain.com
PGADMIN_DEFAULT_PASSWORD=secure-admin-password
```

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
- **Database**: postgresql://[YOUR_POSTGRES_USER]:[YOUR_POSTGRES_PASSWORD]@localhost:5432/[YOUR_POSTGRES_DB]

Replace the bracketed values with what you set in your `.env` file.

## 📁 Files

- `docker-compose.yml`: Service definitions
- `database/init.sql`: Database schema and initial data
- `LOCAL_DATABASE_SETUP.md`: Detailed setup instructions
