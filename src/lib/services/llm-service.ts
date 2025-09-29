import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { PromptTemplate } from '@langchain/core/prompts'
import { z } from 'zod'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY environment variable is required')
}

// Initialize the Gemini model
const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: GOOGLE_API_KEY,
    temperature: 0.7,
})

// Validation schemas
const TaskSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    subtasks: z.array(z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1).max(300)
    })).max(5)
})

const SubtaskSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(300)
})

// Prompt templates
const PROJECT_TASKS_PROMPT = new PromptTemplate({
    template: `You are a project management assistant. Generate UNIQUE, NON-DUPLICATE tasks that complement existing work.

Project Information:
Title: {projectTitle}
Description: {projectDescription}
Comments: {projectComments}

EXISTING TASKS (DO NOT DUPLICATE - be completely different):
{existingTasks}

EXISTING SUBTASKS (for reference):
{existingSubtasks}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 5 NEW tasks that are COMPLETELY DIFFERENT from existing tasks
2. Each task must be UNIQUE - no similar titles or concepts to existing tasks
3. Each task should have 2-3 diverse subtasks
4. Think creatively - explore different aspects, phases, or angles of the project
5. Avoid any overlap with existing task titles or core concepts
6. Generate complementary tasks that fill gaps in the existing work

UNIQUENESS STRATEGY:
- If existing tasks focus on development, suggest planning/design/testing/deployment
- If existing tasks are technical, suggest business/marketing/user experience aspects
- If existing tasks are high-level, suggest detailed implementation tasks
- If existing tasks are frontend, suggest backend/infrastructure/database tasks
- Explore different project phases: research, design, development, testing, deployment, maintenance

Return ONLY a valid JSON array with exactly this structure:
[
  {{
    "title": "Unique task title (max 100 chars, must be different from all existing)",
    "description": "Detailed task description (max 500 chars)",
    "subtasks": [
      {{
        "title": "Subtask title (max 100 chars)",
        "description": "Subtask description (max 300 chars)"
      }}
    ]
  }}
]

Response:`,
    inputVariables: ['projectTitle', 'projectDescription', 'projectComments', 'existingTasks', 'existingSubtasks']
})

const TASK_SUBTASKS_PROMPT = new PromptTemplate({
    template: `You are a task breakdown assistant. Generate UNIQUE subtasks that complement existing work for this specific task.

Project Information:
Title: {projectTitle}
Description: {projectDescription}
Comments: {projectComments}

Task Information:
Title: {taskTitle}
Description: {taskDescription}
Comments: {taskComments}

EXISTING SUBTASKS (DO NOT DUPLICATE - be completely different):
{existingSubtasks}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 5 NEW subtasks that are COMPLETELY DIFFERENT from existing subtasks
2. Each subtask must be UNIQUE - no similar titles or concepts to existing subtasks
3. All subtasks must contribute to completing the main task: "{taskTitle}"
4. Think creatively about different approaches, phases, or aspects of the main task
5. Avoid any overlap with existing subtask titles or core concepts
6. Generate complementary subtasks that fill gaps in the existing work

UNIQUENESS STRATEGY:
- If existing subtasks focus on setup, suggest implementation/testing/documentation
- If existing subtasks are technical, suggest planning/design/validation aspects
- If existing subtasks are high-level, suggest detailed implementation steps
- If existing subtasks are research-focused, suggest practical implementation
- Explore different aspects: preparation, execution, validation, optimization, documentation

Return ONLY a valid JSON array with exactly this structure:
[
  {{
    "title": "Unique subtask title (max 100 chars, must be different from all existing)",
    "description": "Detailed subtask description (max 300 chars)"
  }}
]

Response:`,
    inputVariables: ['projectTitle', 'projectDescription', 'projectComments', 'taskTitle', 'taskDescription', 'taskComments', 'existingSubtasks']
})

// Service interfaces
export interface GenerateTasksRequest {
    projectTitle: string
    projectDescription?: string
    projectComments?: string
    existingTasks?: Array<{
        title: string
        description?: string
        source?: string
    }>
    existingSubtasks?: Array<{
        title: string
        description?: string
        source?: string
    }>
}

export interface GenerateSubtasksRequest {
    projectTitle: string
    projectDescription?: string
    projectComments?: string
    taskTitle: string
    taskDescription?: string
    taskComments?: string
    existingSubtasks?: Array<{
        title: string
        description?: string
        source?: string
    }>
}

export interface GeneratedTask {
    title: string
    description: string
    subtasks: Array<{
        title: string
        description: string
    }>
}

export interface GeneratedSubtask {
    title: string
    description: string
}

class LLMService {
    async generateTasks(request: GenerateTasksRequest): Promise<GeneratedTask[]> {
        try {
            const prompt = await PROJECT_TASKS_PROMPT.format({
                projectTitle: request.projectTitle,
                projectDescription: request.projectDescription || 'No description provided',
                projectComments: request.projectComments || 'No comments',
                existingTasks: request.existingTasks?.map(t =>
                    `- [${t.source?.toUpperCase() || 'USER'}] ${t.title}: ${t.description || 'No description'}`
                ).join('\n') || 'None',
                existingSubtasks: request.existingSubtasks?.map(s =>
                    `- [${s.source?.toUpperCase() || 'USER'}] ${s.title}: ${s.description || 'No description'}`
                ).join('\n') || 'None'
            })

            const response = await model.invoke(prompt)
            const content = response.content.toString()

            console.log('LLM Response for tasks:', content)

            // Extract JSON from the response with multiple patterns
            let jsonString = ''

            // Try different JSON extraction patterns
            const patterns = [
                /\[[\s\S]*\]/,                    // Array pattern
                /```json\s*(\[[\s\S]*?\])\s*```/, // Markdown code block
                /```\s*(\[[\s\S]*?\])\s*```,*/,   // Generic code block
            ]

            for (const pattern of patterns) {
                const match = content.match(pattern)
                if (match) {
                    jsonString = match[1] || match[0]
                    break
                }
            }

            if (!jsonString) {
                console.error('No JSON array found in LLM response:', content)
                throw new Error('No valid JSON found in response')
            }

            const parsedTasks = JSON.parse(jsonString)
            console.log('Parsed tasks:', parsedTasks)

            // Validate each task with better error handling
            const validatedTasks = []
            for (let i = 0; i < parsedTasks.length; i++) {
                try {
                    const validatedTask = TaskSchema.parse(parsedTasks[i])
                    validatedTasks.push(validatedTask)
                } catch (validationError) {
                    console.error(`Validation error for task ${i}:`, validationError)
                    console.error('Invalid task data:', parsedTasks[i])
                    // Skip invalid tasks instead of failing entirely
                    continue
                }
            }

            if (validatedTasks.length === 0) {
                throw new Error('No valid tasks could be parsed from LLM response')
            }

            return validatedTasks.slice(0, 5) // Ensure max 5 tasks
        } catch (error) {
            console.error('Error generating tasks:', error)
            throw new Error('Failed to generate tasks')
        }
    }

    async generateSubtasks(request: GenerateSubtasksRequest): Promise<GeneratedSubtask[]> {
        try {
            const prompt = await TASK_SUBTASKS_PROMPT.format({
                projectTitle: request.projectTitle,
                projectDescription: request.projectDescription || 'No description provided',
                projectComments: request.projectComments || 'No comments',
                taskTitle: request.taskTitle,
                taskDescription: request.taskDescription || 'No description provided',
                taskComments: request.taskComments || 'No comments',
                existingSubtasks: request.existingSubtasks?.map(s =>
                    `- [${s.source?.toUpperCase() || 'USER'}] ${s.title}: ${s.description || 'No description'}`
                ).join('\n') || 'None'
            })

            const response = await model.invoke(prompt)
            const content = response.content.toString()

            console.log('LLM Response for subtasks:', content)

            // Extract JSON from the response with multiple patterns
            let jsonString = ''

            // Try different JSON extraction patterns
            const patterns = [
                /\[[\s\S]*\]/,                    // Array pattern
                /```json\s*(\[[\s\S]*?\])\s*```/, // Markdown code block
                /```\s*(\[[\s\S]*?\])\s*```,*/,   // Generic code block
            ]

            for (const pattern of patterns) {
                const match = content.match(pattern)
                if (match) {
                    jsonString = match[1] || match[0]
                    break
                }
            }

            if (!jsonString) {
                console.error('No JSON array found in LLM response:', content)
                throw new Error('No valid JSON found in response')
            }

            const parsedSubtasks = JSON.parse(jsonString)
            console.log('Parsed subtasks:', parsedSubtasks)

            // Validate each subtask with better error handling
            const validatedSubtasks = []
            for (let i = 0; i < parsedSubtasks.length; i++) {
                try {
                    const validatedSubtask = SubtaskSchema.parse(parsedSubtasks[i])
                    validatedSubtasks.push(validatedSubtask)
                } catch (validationError) {
                    console.error(`Validation error for subtask ${i}:`, validationError)
                    console.error('Invalid subtask data:', parsedSubtasks[i])
                    // Skip invalid subtasks instead of failing entirely
                    continue
                }
            }

            if (validatedSubtasks.length === 0) {
                throw new Error('No valid subtasks could be parsed from LLM response')
            }

            return validatedSubtasks.slice(0, 5) // Ensure max 5 subtasks
        } catch (error) {
            console.error('Error generating subtasks:', error)
            throw new Error('Failed to generate subtasks')
        }
    }
}

export const llmService = new LLMService()
export default llmService
