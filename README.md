# 📝 Task Tracker

A modern, hierarchical task management application powered by **Supabase** with a 4-column layout for organizing projects, tasks, subtasks, and details.

## ✨ Features

- **📊 Hierarchical Organization**: Projects → Tasks → Subtasks → Details
- **🔐 Authentication**: Secure user authentication with Supabase Auth
- **🔄 Drag & Drop**: Sortable tasks and subtasks with @dnd-kit
- **📱 Resizable Layout**: Adjustable column widths with persistent preferences  
- **💬 Real-time Comments**: Commenting system for all levels
- **🎯 Status Management**: To-Do, In Progress, Done tracking
- **🔍 Live Updates**: Real-time data synchronization with Supabase
- **🎨 Modern UI**: Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui

## 🏗️ Architecture

- **Frontend**: Next.js 15 (React) with TypeScript
- **Backend**: Supabase (PostgreSQL + Authentication + API)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **State**: Zustand for client-side state management

## 🚀 Quick Start

### Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18+ required

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd tasktracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a new project in your Supabase dashboard
   - Copy your project URL and anonymous key
   - Run the database schema from `SUPABASE_MIGRATION.md`

4. **Configure environment variables:**
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Start the application:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tasktracker/
├── src/                          # Next.js application
│   ├── app/                     # App router pages
│   │   ├── auth/               # Authentication pages
│   │   └── page.tsx            # Main application
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── features/           # Feature-specific components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utilities and configuration
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state stores
│   │   └── supabase/           # Supabase client configuration
│   └── types/                  # TypeScript definitions
├── SUPABASE_MIGRATION.md        # Complete setup guide
├── next.config.ts              # Next.js configuration
└── DEPLOYMENT.md              # Deployment guide
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

The Task Tracker is optimized for modern deployment platforms with automatic Supabase integration.

### Supported Platforms
- **Vercel** (Recommended - built for Next.js)
- **Railway** 
- **Render** 
- **Netlify**
- **DigitalOcean App Platform**

### Quick Deploy
1. **Set up your Supabase project** (see `SUPABASE_MIGRATION.md`)
2. **Connect this repo** to your chosen platform  
3. **Set environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy!** - Platform handles the rest automatically

See detailed guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)

## 🔧 Configuration

### Environment Variables

**Development** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Production** (Platform Environment Variables):
Same variables as development, but configured in your deployment platform.

## 📊 Database Schema

```sql
-- User management (handled by Supabase Auth)
auth.users → users (id, email, name, ...)

-- Hierarchical task structure
projects (id, user_id, name, status, due_date, ...)
├── tasks (id, project_id, name, status, order_index, ...)
    ├── subtasks (id, task_id, name, status, order_index, ...)
        └── subtask_details (id, subtask_id, description, ...)

-- Additional tables
project_details, task_details, comments (polymorphic)
```

Complete schema and setup instructions: [`SUPABASE_MIGRATION.md`](SUPABASE_MIGRATION.md)

## 🎯 Key Features Explained

### 4-Column Layout
1. **Projects Sidebar**: Create, manage, archive projects
2. **Tasks Column**: Tasks within selected project
3. **Subtasks Column**: Subtasks within selected task  
4. **Details Panel**: Description, status, comments for selected item

### Authentication
- **Email/Password**: Secure user registration and login
- **Session Management**: Automatic token refresh and persistence
- **Protected Routes**: Middleware-based route protection
- **User Isolation**: Data automatically filtered by authenticated user

### State Management
- **Zustand Store**: Centralized state for projects, tasks, subtasks
- **Real-time Updates**: API calls automatically update local state
- **Persistent Preferences**: Column widths saved to localStorage

### Database Integration
- **Supabase Client**: Type-safe database operations
- **Row Level Security**: Automatic data isolation per user
- **Real-time Subscriptions**: Built-in support (ready to implement)
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛡️ Security & Performance

### Security
- **Supabase Auth**: Industry-standard authentication and authorization
- **Row Level Security**: Database-level data isolation
- **Environment Variables**: Secure handling of API credentials
- **Input Validation**: zod schema validation for all forms

### Performance  
- **Next.js 15**: Latest performance optimizations
- **Standalone Output**: Optimized builds for deployment
- **Package Optimization**: Tree-shaking for all dependencies
- **SWC Minification**: Fast compilation and minification
- **Lazy Loading**: Components loaded on demand

## 🔄 Development Workflow

1. **Setup**: Create Supabase project and configure environment
2. **Develop**: `npm run dev` (Hot reload, TypeScript checking)
3. **Test**: Manual testing with user authentication
4. **Deploy**: Push to Git → Platform auto-deployment

## 🚨 Troubleshooting

### Common Issues

1. **Authentication errors**: Check Supabase URL and keys in environment variables
2. **Database connection**: Verify Supabase project is active and accessible
3. **RLS policies**: Ensure Row Level Security policies are properly configured
4. **Build failures**: Ensure all dependencies are installed

### Getting Help

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Migration Guide**: See `SUPABASE_MIGRATION.md` for complete setup
- **Next.js + Supabase**: [Official Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 📚 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: Zustand, React Hook Form
- **Authentication**: Supabase Auth
- **Development**: Hot reload, ESLint, TypeScript
- **Deployment**: Platform-agnostic with environment variables

## 🔄 Migration from PostgreSQL

If you're migrating from the previous PostgreSQL setup, see [`SUPABASE_MIGRATION.md`](SUPABASE_MIGRATION.md) for a complete migration guide with SQL schema and step-by-step instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including authentication flows)
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Ready to manage your tasks efficiently with Supabase?** 🚀

Start with the setup guide in `SUPABASE_MIGRATION.md` and begin organizing your projects!