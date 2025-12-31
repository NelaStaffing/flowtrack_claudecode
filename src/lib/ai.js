import { supabase } from './supabase';

const USE_EDGE_FUNCTION = import.meta.env.VITE_USE_AI_EDGE_FUNCTION === 'true';

export const aiService = {
  async analyzeProjectBrief(basicInfo, brief) {
    if (USE_EDGE_FUNCTION) {
      return this.callEdgeFunction('analyze', {
        name: basicInfo.name,
        client: basicInfo.client,
        brief,
      });
    }

    // Fallback to mock data
    return this.getMockResponse('analyze');
  },

  async recommendTechStack(basicInfo, brief, deliverables) {
    if (USE_EDGE_FUNCTION) {
      return this.callEdgeFunction('techStack', {
        name: basicInfo.name,
        brief,
        deliverables,
      });
    }

    return this.getMockResponse('recommend');
  },

  async generateProjectPlan(basicInfo, brief, deliverables, techStack) {
    if (USE_EDGE_FUNCTION) {
      return this.callEdgeFunction('plan', {
        name: basicInfo.name,
        brief,
        deliverables,
        techStack,
      });
    }

    return this.getMockResponse('project plan');
  },

  async identifyBlockers(basicInfo, brief, deliverables, techStack) {
    if (USE_EDGE_FUNCTION) {
      return this.callEdgeFunction('blockers', {
        name: basicInfo.name,
        brief,
        deliverables,
        techStack,
      });
    }

    return this.getMockResponse('blockers');
  },

  async callEdgeFunction(type, data) {
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analyze', {
        body: { type, data },
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Edge function error:', error);
      console.warn('Falling back to mock data');
      return this.getMockResponse(type);
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
