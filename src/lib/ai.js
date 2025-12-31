// AI Service using Claude (Anthropic)
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

export const aiService = {
  async analyzeProjectBrief(basicInfo, brief) {
    const prompt = `You are an expert project analyst. Analyze this project brief and identify the core deliverables.

Project Name: ${basicInfo.name}
${basicInfo.client ? `Client: ${basicInfo.client}` : ''}

Brief:
${brief}

Provide a JSON response with:
1. A concise project summary (2-3 sentences)
2. List of 3-5 core deliverables (each with a title and brief description)

Format:
{
  "summary": "Project summary here",
  "deliverables": [
    {"title": "Deliverable 1", "description": "Brief description"}
  ]
}`;

    return this.callClaude(prompt);
  },

  async recommendTechStack(basicInfo, brief, deliverables) {
    const prompt = `You are a technical architect. Based on this project, recommend appropriate technologies.

Project: ${basicInfo.name}
Brief: ${brief}

Deliverables:
${deliverables.map((d, i) => `${i + 1}. ${d.title}: ${d.description}`).join('\n')}

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
}`;

    return this.callClaude(prompt);
  },

  async generateProjectPlan(basicInfo, brief, deliverables, techStack) {
    const prompt = `You are a project manager. Create a realistic project plan with milestones and tasks.

Project: ${basicInfo.name}
Brief: ${brief}

Deliverables:
${deliverables.map((d, i) => `${i + 1}. ${d.title}`).join('\n')}

Tech Stack:
${techStack.map((t) => `${t.category}: ${t.recommended}`).join('\n')}

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
}`;

    return this.callClaude(prompt);
  },

  async identifyBlockers(basicInfo, brief, deliverables, techStack) {
    const prompt = `You are a risk analyst. Identify potential blockers and open items for this project.

Project: ${basicInfo.name}
Brief: ${brief}

Deliverables:
${deliverables.map((d) => d.title).join(', ')}

Tech Stack:
${techStack.map((t) => `${t.category}: ${t.recommended}`).join(', ')}

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
}`;

    return this.callClaude(prompt);
  },

  async callClaude(prompt) {
    if (!CLAUDE_API_KEY) {
      console.warn('Claude API key not found');
      return this.getMockResponse(prompt);
    }

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('No JSON found in Claude response');
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return this.getMockResponse(prompt);
    }
  },

  getMockResponse(prompt) {
    // Mock responses for testing when API key is not available
    if (prompt.includes('analyze')) {
      return {
        summary:
          'A comprehensive form-based system with automated data processing and image handling capabilities, designed to collect student information and streamline administrative workflows.',
        deliverables: [
          {
            title: 'Student bio collection form',
            description: 'Multi-entry form for collecting student biographical information',
          },
          {
            title: 'Automated data pipeline',
            description: 'Backend automation to process and validate submitted data',
          },
          {
            title: 'Image processing workflow',
            description: 'System to handle, resize, and store student photos',
          },
          {
            title: 'Admin dashboard',
            description: 'Interface for administrators to view and manage submissions',
          },
        ],
      };
    }

    if (prompt.includes('recommend')) {
      return {
        recommendations: [
          {
            category: 'Form Builder',
            recommended: 'Tally',
            reason: 'Multi-entry fields and clean UX perfect for bio collection',
            alternatives: ['Typeform', 'Google Forms', 'JotForm'],
          },
          {
            category: 'Automation',
            recommended: 'Make.com',
            reason: 'Visual workflow builder for data processing pipelines',
            alternatives: ['Zapier', 'n8n', 'Integromat'],
          },
          {
            category: 'Image Processing',
            recommended: 'Cloudinary',
            reason: 'Auto resizing and batch processing capabilities',
            alternatives: ['imgix', 'Uploadcare', 'ImageKit'],
          },
          {
            category: 'Data Storage',
            recommended: 'Airtable',
            reason: 'Client already using it, easy integration',
            alternatives: ['Notion', 'Supabase', 'Firebase'],
          },
        ],
      };
    }

    if (prompt.includes('project plan')) {
      return {
        milestones: [
          {
            name: 'Requirements Lock',
            tasks: ['Finalize form fields', 'Confirm image specs', 'Map Airtable schema'],
            confidence: 95,
            daysFromStart: 7,
          },
          {
            name: 'Form Build Complete',
            tasks: [
              'Set up Tally form',
              'Configure validation rules',
              'Test submission flow',
            ],
            confidence: 85,
            daysFromStart: 14,
          },
          {
            name: 'Automation Pipeline',
            tasks: [
              'Build Make.com workflow',
              'Connect Airtable integration',
              'Set up image processing',
            ],
            confidence: 80,
            daysFromStart: 21,
          },
          {
            name: 'Testing & UAT',
            tasks: [
              'End-to-end testing',
              'User acceptance testing',
              'Fix identified issues',
            ],
            confidence: 75,
            daysFromStart: 28,
          },
          {
            name: 'Handover & Launch',
            tasks: [
              'Admin training',
              'Documentation delivery',
              'Go-live support',
            ],
            confidence: 90,
            daysFromStart: 35,
          },
        ],
      };
    }

    if (prompt.includes('blockers')) {
      return {
        blockers: [
          {
            title: 'CDE image dimensions not specified',
            description: 'Brief mentions "formatted for CDE" but no specs provided',
            severity: 'high',
          },
          {
            title: 'LDE student inclusion unclear',
            description: "Brief doesn't specify if LDE students are included",
            severity: 'medium',
          },
          {
            title: 'Office list scope undefined',
            description: 'Need office list for dropdown field',
            severity: 'medium',
          },
          {
            title: 'Airtable API credentials needed',
            description: 'Required for automation workflow',
            severity: 'high',
          },
        ],
      };
    }

    return {};
  },
};
