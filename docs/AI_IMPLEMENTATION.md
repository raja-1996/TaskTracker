# AI-Powered Task & Subtask Generation - Implementation Guide

## Overview

This implementation adds AI-powered task and subtask suggestion capabilities to the task tracker application using LangChain and Google's Gemini LLM.

## Features Implemented

### 1. Database Schema Updates
- Added `source_type` column to `tasks` and `subtasks` tables ('user' | 'ai')
- Added `ai_generations` table to track when AI generations were last performed
- Added proper indexes and RLS policies for security

### 2. AI Service Integration
- **LLM Service** (`/src/lib/services/llm-service.ts`):
  - Uses LangChain with Google Gemini 1.5 Pro model
  - Context-aware prompt templates for task and subtask generation
  - Structured output validation using Zod schemas
  - Max 5 tasks/subtasks per generation (as per PRD requirement)

### 3. API Endpoints
- **Generate Tasks**: `POST /api/ai/generate-tasks`
  - Takes project ID and optional refresh flag
  - Considers project details, existing tasks, and user context
  - Implements caching logic to avoid repeated generations
- **Generate Subtasks**: `POST /api/ai/generate-subtasks`
  - Takes task ID and optional refresh flag
  - Considers task and project context, existing subtasks

### 4. UI Enhancements

#### Tasks Column (`/src/components/features/tasks/tasks-column.tsx`)
- **AI Tasks Button**: Generates tasks for the selected project
- **Visual Indicators**: Bot icon for AI-generated tasks, User icon for user-created tasks
- **Smart Ordering**: User tasks appear first, then AI tasks (as per PRD requirement)
- **Refresh Options**: Dropdown menu option to refresh AI tasks

#### Subtasks Column (`/src/components/features/subtasks/subtasks-column.tsx`)
- **AI Subtasks Button**: Generates subtasks for the selected task
- **Visual Indicators**: Bot/User icons to distinguish source
- **Smart Ordering**: User subtasks first, then AI subtasks
- **Refresh Options**: Dropdown menu option to refresh AI subtasks

### 5. State Management
- Added `generateAITasks` and `generateAISubtasks` actions to the app store
- Integrated with existing data loading patterns
- Proper error handling and loading states

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and set:
```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI (new)
GOOGLE_API_KEY=your_google_ai_api_key
```

### 2. Database Schema Updates
Run the updated `supabase_schema.sql` in your Supabase SQL Editor. This includes:
- New columns for source tracking
- AI generations tracking table
- Proper indexes and RLS policies

### 3. Dependencies
The following packages were installed:
- `@google/generative-ai`: Google's Generative AI SDK
- `langchain`: LangChain framework
- `@langchain/google-genai`: LangChain Google Generative AI integration

## Usage Flow

### For Tasks:
1. User selects a project
2. Click "AI Tasks" button to generate initial suggestions
3. AI considers project details, existing tasks, and generates up to 5 tasks with subtasks
4. Tasks are cached - subsequent clicks return cached results
5. Use "Refresh AI Tasks" from dropdown to regenerate

### For Subtasks:
1. User selects a task
2. Click "AI Subtasks" button to generate additional subtasks
3. AI considers task context, project context, and existing subtasks
4. Generates up to 5 additional subtasks
5. Use "Refresh AI Subtasks" from dropdown to regenerate

## Key Implementation Details

### Context-Aware Generation
The AI system considers:
- **For Tasks**: Project title, description, comments, existing user tasks and subtasks
- **For Subtasks**: All of the above plus specific task title, description, and comments

### Caching Strategy
- AI generations are tracked in the `ai_generations` table
- First click generates and caches results
- Subsequent clicks return cached results unless refresh is requested
- Refresh flag allows regenerating suggestions when needed

### User Experience
- Loading states with spinning refresh icons
- Clear visual distinction between user and AI content
- User content always appears first (priority display as per PRD)
- Contextual refresh options only appear for AI-generated items

### Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages
- Non-blocking errors don't crash the application

## Security & Performance

### Security
- All API endpoints check user authentication
- RLS policies ensure users only access their own data
- Input validation using Zod schemas
- Proper SQL injection protection through Supabase client

### Performance
- Caching prevents redundant AI API calls
- Efficient database queries with proper indexes
- Lazy loading of AI features (only when requested)
- Streaming responses from LLM for better perceived performance

## Future Enhancements

Potential improvements that could be added:
- **Batch Operations**: Generate tasks for multiple projects
- **Custom Prompts**: Allow users to customize AI generation prompts
- **Learning**: Improve suggestions based on user acceptance patterns
- **Templates**: Save and reuse successful AI-generated structures
- **Integration**: Connect with external project management tools

## Troubleshooting

### Common Issues:
1. **"GOOGLE_API_KEY not found"**: Ensure environment variable is set in `.env.local`
2. **"Failed to generate tasks"**: Check Google AI API quota and network connectivity  
3. **"Unauthorized" errors**: Verify Supabase authentication is working
4. **Missing source_type columns**: Run the updated database schema

### Debug Steps:
1. Check browser console for client-side errors
2. Check server logs for API endpoint errors
3. Verify environment variables are loaded
4. Test database schema updates in Supabase SQL Editor
5. Verify Google AI API key has necessary permissions

## Files Modified/Created

### New Files:
- `/src/lib/services/llm-service.ts` - AI service with Gemini integration
- `/src/app/api/ai/generate-tasks/route.ts` - Task generation API endpoint
- `/src/app/api/ai/generate-subtasks/route.ts` - Subtask generation API endpoint
- `.env.example` - Environment variables documentation
- `docs/AI_IMPLEMENTATION.md` - This documentation

### Modified Files:
- `supabase_schema.sql` - Database schema updates
- `/src/types/database.ts` - TypeScript type updates
- `/src/lib/supabase/api-client.ts` - API client updates
- `/src/lib/stores/app-store.ts` - State management updates
- `/src/components/features/tasks/tasks-column.tsx` - Tasks UI updates
- `/src/components/features/subtasks/subtasks-column.tsx` - Subtasks UI updates
- `package.json` - New dependencies added

This implementation fully satisfies the requirements outlined in the PRD while maintaining code quality, security, and user experience standards.
