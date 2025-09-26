# 📝 Task Tracker

A modern, hierarchical task management application with a 4-column layout for organizing projects, tasks, subtasks, and details.

## ✨ Features

- **📊 Hierarchical Organization**: Projects → Tasks → Subtasks → Details
- **🔄 Drag & Drop**: Sortable tasks and subtasks with @dnd-kit
- **📱 Resizable Layout**: Adjustable column widths with persistent preferences  
- **💬 Real-time Comments**: Commenting system for all levels
- **🎯 Status Management**: To-Do, In Progress, Done tracking
- **🔍 Live Updates**: Real-time data synchronization
- **🎨 Modern UI**: Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui

## 🏗️ Architecture

- **Frontend**: Next.js 15 (React) application
- **API**: PostgREST (auto-generates REST API from PostgreSQL)
- **Database**: PostgreSQL with complete relational schema
- **State**: Zustand for client-side state management

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd tasktracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start external services (PostgreSQL + PostgREST):**
   ```bash
   npm run dev:services
   ```

4. **Start the Next.js application:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### One-Command Setup

```bash
# Start services and application together
npm run dev:full
```

## 📁 Project Structure

```
tasktracker/
├── src/                          # Next.js application
│   ├── app/                     # App router pages
│   ├── components/              # React components
│   │   ├── features/           # Feature-specific components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utilities and API client
│   └── types/                  # TypeScript definitions
├── external/                    # Local development services
│   ├── docker-compose.yml     # PostgreSQL + PostgREST
│   ├── database/              # Database schema
│   └── start-dev.sh           # Development helper script
├── next.config.ts              # Next.js configuration
├── nixpacks.toml              # Build optimization config
└── DEPLOYMENT.md              # Deployment guide
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start Next.js development server
- `npm run dev:services` - Start external services (PostgreSQL + PostgREST)
- `npm run dev:full` - Start services + application together

### Production
- `npm run build` - Build for production (optimized with standalone output)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

The Task Tracker uses **Nixpacks** for platform-agnostic deployment. It automatically detects Next.js and builds optimized containers without any configuration.

### Supported Platforms
- **Railway** (Recommended - automatic Nixpacks detection)
- **Render** 
- **Vercel**
- **DigitalOcean App Platform**
- **Any Docker-compatible platform**

### Quick Deploy
1. **Deploy your API backend** separately (see `external/` folder)
2. **Connect this repo** to your chosen platform  
3. **Set environment variable**: `NEXT_PUBLIC_API_URL=https://your-api.com`
4. **Deploy!** - Platform handles the rest automatically

See detailed guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)

## 🔧 Configuration

### Environment Variables

**Development** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3003
```

**Production** (Platform Environment Variables):
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### External Services

The application requires a PostgreSQL database with PostgREST API:

- **Local Development**: Use `npm run dev:services` (Docker required)
- **Production**: Deploy separately or use managed services like Supabase

## 📊 Database Schema

```sql
-- Hierarchical structure
projects (id, name, status, due_date, ...)
├── tasks (id, project_id, name, status, order_index, ...)
    ├── subtasks (id, task_id, name, status, order_index, ...)
        └── subtask_details (id, subtask_id, description, ...)

-- Additional tables
project_details, task_details, comments (polymorphic)
```

## 🎯 Key Features Explained

### 4-Column Layout
1. **Projects Sidebar**: Create, manage, archive projects
2. **Tasks Column**: Tasks within selected project
3. **Subtasks Column**: Subtasks within selected task  
4. **Details Panel**: Description, status, comments for selected subtask

### State Management
- **Zustand Store**: Centralized state for projects, tasks, subtasks
- **Real-time Updates**: API calls automatically update local state
- **Persistent Preferences**: Column widths saved to localStorage

### API Integration
- **PostgREST**: Auto-generated REST API from PostgreSQL schema
- **Type Safety**: Full TypeScript types generated from database schema
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛡️ Security & Performance

### Security
- **Environment Variables**: Secure handling of API URLs and secrets
- **CORS**: Configured for cross-origin API requests
- **Input Validation**: zod schema validation for all forms

### Performance  
- **Standalone Output**: Optimized Next.js builds for deployment
- **Package Optimization**: Tree-shaking for lucide-react and radix-ui
- **SWC Minification**: Fast compilation and minification
- **Lazy Loading**: Components loaded on demand

## 🔄 Development Workflow

1. **Start Services**: `npm run dev:services` (Docker containers)
2. **Develop**: `npm run dev` (Hot reload, TypeScript checking)
3. **Test**: Manual testing with sample data (pre-loaded)
4. **Deploy**: Push to Git → Platform auto-deployment

## 🚨 Troubleshooting

### Common Issues

1. **Services won't start**: Check Docker is running
2. **API connection errors**: Verify `NEXT_PUBLIC_API_URL` environment variable
3. **Build failures**: Ensure all dependencies are installed

### Debugging

```bash
# Check external services
cd external && docker-compose ps

# View service logs  
cd external && docker-compose logs

# Reset database (WARNING: deletes data)
cd external && docker-compose down -v && docker-compose up -d
```

## 📚 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: Zustand, React Hook Form
- **API**: PostgREST, PostgreSQL
- **Development**: Docker, Hot reload, ESLint
- **Deployment**: Nixpacks, Platform-agnostic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Ready to manage your tasks efficiently?** 🚀

Start with `npm run dev:full` and begin organizing your projects!