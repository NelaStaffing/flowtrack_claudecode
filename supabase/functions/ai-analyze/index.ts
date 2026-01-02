// Supabase Edge Function for AI Analysis using Claude
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzeRequest {
  type: 'analyze' | 'techStack' | 'plan' | 'blockers'
  data: {
    name?: string
    client?: string
    brief?: string
    deliverables?: Array<{ title: string; description: string }>
    techStack?: Array<any>
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request
    const { type, data }: AnalyzeRequest = await req.json()

    // Generate prompt based on type
    let prompt = ''

    if (type === 'analyze') {
      prompt = `You are an expert project analyst. Analyze this project brief and identify the core deliverables.

Project Name: ${data.name}
${data.client ? `Client: ${data.client}` : ''}

Brief:
${data.brief}

Provide a JSON response with:
1. A concise project summary (2-3 sentences)
2. List of 3-5 core deliverables (each with a title and brief description)

Format:
{
  "summary": "Project summary here",
  "deliverables": [
    {"title": "Deliverable 1", "description": "Brief description"}
  ]
}`
    } else if (type === 'techStack') {
      prompt = `You are a technical architect. Based on this project, recommend appropriate technologies.

Project: ${data.name}
Brief: ${data.brief}

Deliverables:
${data.deliverables?.map((d, i) => `${i + 1}. ${d.title}: ${d.description}`).join('\n')}

Recommend technologies in these categories:
- Frontend/Form Builder
- Backend/Automation
- Database/Storage
- Image/File Processing (if applicable)
- Other relevant tools

For each recommendation, provide:
- Category name
- Recommended tool name
- Why it's recommended (1 sentence)
- Alternatives (2-3 other options)

Format as JSON:
{
  "recommendations": [
    {
      "category": "Category Name",
      "recommended": "Tool Name",
      "reason": "Why it's good for this project",
      "alternatives": ["Alt1", "Alt2", "Alt3"]
    }
  ]
}`
    } else if (type === 'plan') {
      prompt = `You are a project manager. Create a realistic project plan with milestones and tasks.

Project: ${data.name}
Brief: ${data.brief}

Deliverables:
${data.deliverables?.map((d, i) => `${i + 1}. ${d.title}`).join('\n')}

Tech Stack:
${data.techStack?.map((t: any) => `${t.category}: ${t.recommended}`).join('\n')}

Create 4-6 milestones with:
- Name
- 3-4 tasks per milestone
- Estimated completion confidence (0-100)
- Suggested due date offset from project start (in days)

Format as JSON:
{
  "milestones": [
    {
      "name": "Milestone Name",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "confidence": 85,
      "daysFromStart": 14
    }
  ]
}`
    } else if (type === 'blockers') {
      prompt = `You are a risk analyst. Identify potential blockers and open items for this project.

Project: ${data.name}
Brief: ${data.brief}

Deliverables:
${data.deliverables?.map((d) => d.title).join(', ')}

Tech Stack:
${data.techStack?.map((t: any) => `${t.category}: ${t.recommended}`).join(', ')}

Identify 3-5 potential blockers/open items with:
- Title (short, clear)
- Description (why this is a concern)
- Severity (high/medium/low)

Format as JSON:
{
  "blockers": [
    {
      "title": "Blocker title",
      "description": "Why this needs attention",
      "severity": "high"
    }
  ]
}`
    }

    // Call Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const claudeData = await response.json()
    const content = claudeData.content[0].text

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response')
    }

    const result = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
