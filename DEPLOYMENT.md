# 🚀 Task Tracker Deployment Guide

This guide covers deploying the Task Tracker Next.js application using modern deployment platforms.

## 📋 Prerequisites

- **External API**: Your PostgreSQL + PostgREST backend running separately
- **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket
- **Environment Variables**: API URL configuration

## 🎯 Deployment Architecture

Since this is a **Next.js frontend-only deployment**, you need:

1. **Frontend**: Next.js app (this repository) → Deploy to any platform
2. **Backend**: PostgreSQL + PostgREST → Deploy separately

## 🌐 Platform Options

### Option 1: Railway (Nixpacks Auto-Detection)

Railway automatically uses Nixpacks for Next.js projects.

1. **Connect Repository** to Railway
2. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```
3. **Deploy** - Railway handles the rest!

### Option 2: Render

1. **Create Web Service** from GitHub repo
2. **Configure**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

### Option 3: Vercel

1. **Connect GitHub repo** to Vercel
2. **Set Environment Variables** in Vercel dashboard
3. **Auto-deploy** on every push

### Option 4: DigitalOcean App Platform

1. **Create App** from GitHub repo
2. **Auto-detect** Next.js configuration
3. **Set Environment Variables**
4. **Deploy**

### Option 5: Generic Docker Platform

Use Nixpacks locally to build Docker image:

```bash
# Install Nixpacks
curl -sSL https://nixpacks.com/install.sh | bash

# Build Docker image
nixpacks build . --name tasktracker

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://your-api.com tasktracker
```

## 🔧 Backend API Setup

You need to deploy your API separately. Here are the options:

### Option A: Railway (Recommended)

Deploy the external services from the `external/` folder:

```bash
# Create a separate Railway project for API
# Upload external/docker-compose.yml as a Railway service
```

### Option B: Supabase (Managed)

Use Supabase as your backend (PostgreSQL + REST API built-in):

1. Create Supabase project
2. Import your database schema
3. Use Supabase URL as `NEXT_PUBLIC_API_URL`

### Option C: Any VPS

```bash
# On your server
git clone your-repo
cd tasktracker/external
docker-compose up -d

# API will be available at your-server-ip:3003
```

## ⚙️ Configuration

### Environment Variables

The only required environment variable:

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Nixpacks Configuration

The repository includes `nixpacks.toml` for optimized builds:

```toml
[variables]
NODE_ENV = "production"
NEXT_TELEMETRY_DISABLED = "1"

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### Next.js Configuration

Optimized for deployment in `next.config.ts`:

- **Standalone output**: Minimizes deployment size
- **SWC minification**: Faster builds
- **Package optimization**: Tree-shaking for UI libraries

## 🚀 Deployment Workflow

### Quick Deploy Steps

1. **Deploy your API backend** (choose option A, B, or C above)
2. **Get your API URL** (e.g., `https://api.yourdomain.com`)
3. **Connect this repo** to your chosen platform
4. **Set environment variable**: `NEXT_PUBLIC_API_URL`
5. **Deploy!**

### Development → Production

```bash
# 1. Develop locally
npm run dev:full  # Starts local services + Next.js

# 2. Push to Git
git add . && git commit -m "feature: new updates" && git push

# 3. Auto-deployment
# Platform automatically detects changes and deploys
```

## 🔄 Platform-Specific Notes

### Railway
- **Nixpacks**: Auto-detected
- **Custom Domain**: Available on paid plans
- **Auto-SSL**: Included
- **Environment Variables**: Set in Railway dashboard

### Render
- **Build Detection**: Automatic
- **Free Tier**: Available with limitations
- **Custom Domain**: Available
- **Auto-SSL**: Included

### Vercel
- **Next.js Optimized**: Native support
- **Edge Functions**: Available
- **Analytics**: Built-in
- **Free Tier**: Generous limits

### DigitalOcean
- **App Platform**: Managed deployment
- **Scaling**: Manual and automatic options
- **Monitoring**: Basic metrics included

## 🛡️ Security & Performance

### Environment Variables
- **Never commit secrets** to repository
- **Use platform environment variable management**
- **Validate required variables** in Next.js config

### API Security
- **CORS**: Configure your API for your frontend domain
- **HTTPS**: Always use HTTPS for both frontend and API
- **Rate Limiting**: Implement on your API server

### Performance
- **CDN**: Most platforms provide automatic CDN
- **Caching**: Next.js handles static optimization
- **Bundle Analysis**: Use `npm run build` to check sizes

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check API server is accessible from the internet
   - Ensure CORS is configured on your API

2. **Build Failures**:
   - Check all dependencies are in `package.json`
   - Verify Node.js version compatibility
   - Review build logs for specific errors

3. **Runtime Errors**:
   - Check browser console for client-side errors
   - Verify API endpoints are responding
   - Test API manually with curl/Postman

### Debugging Commands

```bash
# Test API connectivity
curl https://your-api-domain.com/projects

# Local build test
npm run build && npm start

# Check environment variables (in platform dashboard)
echo $NEXT_PUBLIC_API_URL
```

## 📊 Monitoring & Maintenance

### Application Monitoring
- **Error Tracking**: Consider Sentry integration
- **Performance**: Use platform monitoring tools
- **Uptime**: Set up status page monitoring

### Updates
- **Automatic Deployment**: Push to main branch
- **Rollback**: Use platform rollback features if needed
- **Dependencies**: Keep packages updated regularly

## 🎯 Best Practices

### Repository Structure
- **Clean Separation**: Frontend in root, external services in `external/`
- **Platform Agnostic**: No platform-specific config files
- **Documentation**: Clear README and deployment instructions

### Deployment Strategy
- **Environment Parity**: Keep dev/prod environments similar
- **Gradual Rollout**: Test changes in staging first
- **Health Checks**: Implement basic health endpoints

## 📚 Useful Resources

- **Nixpacks Documentation**: [https://nixpacks.com/](https://nixpacks.com/)
- **Next.js Deployment**: [https://nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Railway Docs**: [https://docs.railway.app/](https://docs.railway.app/)
- **Render Docs**: [https://docs.render.com/](https://docs.render.com/)

---

## 🎉 Quick Start Summary

1. **Choose a platform** (Railway recommended for simplicity)
2. **Deploy your API** separately (use `external/` folder contents)
3. **Connect this repo** to your chosen platform
4. **Set `NEXT_PUBLIC_API_URL`** environment variable
5. **Deploy and enjoy!** 🚀

The platform will automatically detect Next.js, use Nixpacks for building, and deploy your application with zero additional configuration needed!