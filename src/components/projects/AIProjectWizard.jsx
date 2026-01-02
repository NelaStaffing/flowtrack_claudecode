import React, { useState } from 'react';
import { supabase, supabaseHelpers } from '../../lib/supabase';
import { aiService } from '../../lib/ai';

function WizardStep({ number, title, description, active, completed }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
          completed
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <div className="flex-1">
        <p
          className={`font-semibold text-sm ${
            active ? 'text-purple-600' : completed ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function LoadingSpinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">{message}</p>
      <p className="text-sm text-gray-400 mt-2">This may take a few seconds...</p>
    </div>
  );
}

export default function AIProjectWizard({ onClose, onComplete, userId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [basicInfo, setBasicInfo] = useState({ name: '', client: '' });
  const [brief, setBrief] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [techStack, setTechStack] = useState([]);
  const [plan, setPlan] = useState(null);
  const [blockers, setBlockers] = useState([]);

  // Editing state
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  // Tech stack editing state
  const [editingTechStack, setEditingTechStack] = useState(null);
  const [techEditForm, setTechEditForm] = useState({
    category: '',
    recommended: '',
    reason: '',
    alternatives: [],
  });

  // Milestone editing state
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneEditForm, setMilestoneEditForm] = useState({ name: '' });
  const [expandedMilestones, setExpandedMilestones] = useState([0]); // First milestone expanded by default

  // Timeline state
  const [timeline, setTimeline] = useState(null);
  const [timelineView, setTimelineView] = useState('timeline'); // 'timeline' | 'calendar' | 'gantt'
  const [signOffDate, setSignOffDate] = useState('');

  // Blocker resolution state
  const [resolvedBlockers, setResolvedBlockers] = useState([]);
  const [stakeholders, setStakeholders] = useState([
    {
      id: '1',
      name: 'Maria Rodriguez',
      role: 'Project Manager',
      company: 'Client Corp',
      availability: 'limited',
      responseTime: 36,
      preferredContact: 'email',
      preferredDays: ['Tuesday', 'Wednesday'],
      decisionAuthority: 'medium',
      notes: 'CC assistant on all emails',
    },
    {
      id: '2',
      name: 'Sarah Chen',
      role: 'Technical Lead',
      company: 'Client Corp',
      availability: 'moderate',
      responseTime: 12,
      preferredContact: 'slack',
      preferredDays: ['Tuesday', 'Wednesday', 'Thursday'],
      decisionAuthority: 'high',
      notes: 'Available for quick calls',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'QA Manager',
      company: 'Client Corp',
      availability: 'high',
      responseTime: 4,
      preferredContact: 'slack',
      preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      decisionAuthority: 'low',
      notes: 'Very responsive, ideal for testing phase',
    },
  ]);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Name and description' },
    { id: 2, title: 'Brief', description: 'Project details' },
    { id: 3, title: 'Analysis', description: 'AI analyzes requirements' },
    { id: 4, title: 'Tech Stack', description: 'Technology recommendations' },
    { id: 5, title: 'Plan', description: 'AI-generated milestones' },
    { id: 6, title: 'Timeline', description: 'AI timeline planning' },
    { id: 7, title: 'Review', description: 'Final review' },
  ];

  const handleNext = async () => {
    if (currentStep === 2) {
      // After brief, run AI analysis
      setLoading(true);
      try {
        const result = await aiService.analyzeProjectBrief(basicInfo, brief);
        setAnalysis(result);
        setCurrentStep(3);
      } catch (error) {
        console.error('Analysis error:', error);
        alert('Failed to analyze project. Using mock data for now.');
        const mockResult = await aiService.getMockResponse('analyze');
        setAnalysis(mockResult);
        setCurrentStep(3);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 3) {
      // After analysis, get tech stack recommendations
      setLoading(true);
      try {
        const result = await aiService.recommendTechStack(
          basicInfo,
          brief,
          analysis.deliverables
        );
        setTechStack(result.recommendations);
        setCurrentStep(4);
      } catch (error) {
        console.error('Tech stack error:', error);
        const mockResult = await aiService.getMockResponse('recommend');
        setTechStack(mockResult.recommendations);
        setCurrentStep(4);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 4) {
      // After tech stack, generate plan
      setLoading(true);
      try {
        const result = await aiService.generateProjectPlan(
          basicInfo,
          brief,
          analysis.deliverables,
          techStack
        );
        setPlan(result);
        setCurrentStep(5);
      } catch (error) {
        console.error('Plan error:', error);
        const mockResult = await aiService.getMockResponse('project plan');
        setPlan(mockResult);
        setCurrentStep(5);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 5) {
      // After plan, identify blockers
      setLoading(true);
      try {
        const result = await aiService.identifyBlockers(
          basicInfo,
          brief,
          analysis.deliverables,
          techStack
        );
        setBlockers(result.blockers);
        setCurrentStep(6);
      } catch (error) {
        console.error('Blockers error:', error);
        const mockResult = await aiService.getMockResponse('blockers');
        setBlockers(mockResult.blockers);
        setCurrentStep(6);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Deliverable editing functions
  const handleEditDeliverable = (index) => {
    const deliverable = analysis.deliverables[index];
    setEditForm({ title: deliverable.title, description: deliverable.description });
    setEditingDeliverable(index);
  };

  const handleSaveDeliverable = () => {
    if (editingDeliverable !== null) {
      const updatedDeliverables = [...analysis.deliverables];
      updatedDeliverables[editingDeliverable] = {
        title: editForm.title,
        description: editForm.description,
      };
      setAnalysis({ ...analysis, deliverables: updatedDeliverables });
      setEditingDeliverable(null);
      setEditForm({ title: '', description: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingDeliverable(null);
    setEditForm({ title: '', description: '' });
  };

  const handleRemoveDeliverable = (index) => {
    const updatedDeliverables = analysis.deliverables.filter((_, i) => i !== index);
    setAnalysis({ ...analysis, deliverables: updatedDeliverables });
  };

  const handleAddDeliverable = () => {
    const newDeliverable = {
      title: 'New Deliverable',
      description: 'Click edit to add description',
    };
    setAnalysis({
      ...analysis,
      deliverables: [...analysis.deliverables, newDeliverable],
    });
  };

  const handleReanalyze = async () => {
    setLoading(true);
    try {
      const result = await aiService.analyzeProjectBrief(basicInfo, brief);
      setAnalysis(result);
    } catch (error) {
      console.error('Re-analysis error:', error);
      alert('Failed to re-analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Tech stack editing functions
  const handleEditTechStack = (index) => {
    const tech = techStack[index];
    setTechEditForm({
      category: tech.category,
      recommended: tech.recommended,
      reason: tech.reason,
      alternatives: tech.alternatives || [],
    });
    setEditingTechStack(index);
  };

  const handleSaveTechStack = () => {
    if (editingTechStack !== null) {
      const updatedTechStack = [...techStack];
      updatedTechStack[editingTechStack] = {
        category: techEditForm.category,
        recommended: techEditForm.recommended,
        reason: techEditForm.reason,
        alternatives: techEditForm.alternatives,
      };
      setTechStack(updatedTechStack);
      setEditingTechStack(null);
      setTechEditForm({ category: '', recommended: '', reason: '', alternatives: [] });
    }
  };

  const handleCancelTechEdit = () => {
    setEditingTechStack(null);
    setTechEditForm({ category: '', recommended: '', reason: '', alternatives: [] });
  };

  const handleRemoveTechStack = (index) => {
    const updatedTechStack = techStack.filter((_, i) => i !== index);
    setTechStack(updatedTechStack);
  };

  const handleSwitchToAlternative = (techIndex, alternative) => {
    const updatedTechStack = [...techStack];
    const currentRecommended = updatedTechStack[techIndex].recommended;

    // Swap: current recommended becomes alternative, alternative becomes recommended
    updatedTechStack[techIndex].recommended = alternative;
    const alts = updatedTechStack[techIndex].alternatives || [];
    const newAlternatives = alts.map((alt) => (alt === alternative ? currentRecommended : alt));
    updatedTechStack[techIndex].alternatives = newAlternatives;

    setTechStack(updatedTechStack);
  };

  const handleAddTechStack = () => {
    const newTech = {
      category: 'New Category',
      recommended: 'New Technology',
      reason: 'Click edit to add reason',
      alternatives: [],
    };
    setTechStack([...techStack, newTech]);
  };

  const handleRegenerateTechStack = async () => {
    setLoading(true);
    try {
      const result = await aiService.recommendTechStack(basicInfo, brief, analysis.deliverables);
      setTechStack(result.recommendations);
    } catch (error) {
      console.error('Tech stack regeneration error:', error);
      alert('Failed to regenerate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Milestone editing functions
  const toggleMilestone = (index) => {
    if (expandedMilestones.includes(index)) {
      setExpandedMilestones(expandedMilestones.filter((i) => i !== index));
    } else {
      setExpandedMilestones([...expandedMilestones, index]);
    }
  };

  const handleEditMilestone = (index) => {
    const milestone = plan.milestones[index];
    setMilestoneEditForm({ name: milestone.name });
    setEditingMilestone(index);
  };

  const handleSaveMilestone = () => {
    if (editingMilestone !== null) {
      const updatedMilestones = [...plan.milestones];
      updatedMilestones[editingMilestone].name = milestoneEditForm.name;
      setPlan({ ...plan, milestones: updatedMilestones });
      setEditingMilestone(null);
      setMilestoneEditForm({ name: '' });
    }
  };

  const handleCancelMilestoneEdit = () => {
    setEditingMilestone(null);
    setMilestoneEditForm({ name: '' });
  };

  const handleToggleTask = (milestoneIndex, taskIndex) => {
    const updatedMilestones = [...plan.milestones];
    const tasks = updatedMilestones[milestoneIndex].tasks;

    // Toggle task completion (add/remove checkmark)
    if (!updatedMilestones[milestoneIndex].completedTasks) {
      updatedMilestones[milestoneIndex].completedTasks = [];
    }

    const completedTasks = updatedMilestones[milestoneIndex].completedTasks;
    if (completedTasks.includes(taskIndex)) {
      updatedMilestones[milestoneIndex].completedTasks = completedTasks.filter(
        (i) => i !== taskIndex
      );
    } else {
      updatedMilestones[milestoneIndex].completedTasks.push(taskIndex);
    }

    setPlan({ ...plan, milestones: updatedMilestones });
  };

  const handleAddTask = (milestoneIndex) => {
    const updatedMilestones = [...plan.milestones];
    updatedMilestones[milestoneIndex].tasks.push('New task - click to edit');
    setPlan({ ...plan, milestones: updatedMilestones });
  };

  const handleRemoveTask = (milestoneIndex, taskIndex) => {
    const updatedMilestones = [...plan.milestones];
    updatedMilestones[milestoneIndex].tasks = updatedMilestones[milestoneIndex].tasks.filter(
      (_, i) => i !== taskIndex
    );
    setPlan({ ...plan, milestones: updatedMilestones });
  };

  const handleRemoveMilestone = (index) => {
    const updatedMilestones = plan.milestones.filter((_, i) => i !== index);
    setPlan({ ...plan, milestones: updatedMilestones });
  };

  const handleAddMilestone = () => {
    const newMilestone = {
      name: 'New Milestone',
      tasks: ['Task 1', 'Task 2', 'Task 3'],
      confidence: 80,
      daysFromStart: 30,
      completedTasks: [],
    };
    setPlan({ ...plan, milestones: [...plan.milestones, newMilestone] });
  };

  const handleRegeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await aiService.generateProjectPlan(
        basicInfo,
        brief,
        analysis.deliverables,
        techStack
      );
      setPlan(result);
    } catch (error) {
      console.error('Plan regeneration error:', error);
      alert('Failed to regenerate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Timeline generation functions
  const generateTimeline = (targetDate, milestones, stakeholderList) => {
    if (!targetDate) return null;

    const events = [];
    const signOffDateObj = new Date(targetDate);
    let currentDate = new Date(signOffDateObj);

    // Helper to get buffer days based on availability
    const getBufferDays = (availability) => {
      switch (availability) {
        case 'very-limited':
          return 6;
        case 'limited':
          return 4;
        case 'moderate':
          return 2;
        case 'high':
          return 1;
        default:
          return 2;
      }
    };

    // Helper to format date
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Helper to subtract days
    const subtractDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    };

    // Add final sign-off event
    events.push({
      id: 'final-signoff',
      date: formatDate(signOffDateObj),
      type: 'milestone',
      title: 'Final Sign-Off & Delivery',
      description: 'Project completion and final client approval',
      approvalRequired: true,
      isFinal: true,
      tasks: ['Final presentation', 'Sign-off documentation', 'Project handover'],
      completed: false,
      bufferDays: 0,
    });

    // Add UAT phase (5-7 days before sign-off)
    currentDate = subtractDays(currentDate, 7);
    events.push({
      id: 'uat-phase',
      date: formatDate(currentDate),
      type: 'milestone',
      title: 'UAT & Testing Phase',
      description: 'User acceptance testing with client stakeholders',
      stakeholder: stakeholderList[2], // Mike (QA Manager)
      approvalRequired: true,
      tasks: ['UAT execution', 'Bug fixes', 'Final QA'],
      completed: false,
      bufferDays: getBufferDays(stakeholderList[2].availability),
      aiNote: `⚡ ${stakeholderList[2].name} is very responsive - ideal for quick feedback loops during testing`,
    });

    // Add development milestones from plan
    milestones?.forEach((milestone, index) => {
      const bufferDays = getBufferDays('moderate');
      currentDate = subtractDays(currentDate, milestone.daysFromStart / milestones.length + bufferDays);

      events.push({
        id: `milestone-${index}`,
        date: formatDate(currentDate),
        type: 'milestone',
        title: milestone.name,
        description: `Development milestone ${index + 1}`,
        tasks: milestone.tasks || [],
        completed: false,
        bufferDays: bufferDays,
      });
    });

    // Add client progress reports (weekly)
    const reportCount = Math.floor((signOffDateObj - currentDate) / (7 * 24 * 60 * 60 * 1000));
    for (let i = 1; i <= Math.min(reportCount, 3); i++) {
      const reportDate = subtractDays(signOffDateObj, i * 7);
      events.push({
        id: `progress-${i}`,
        date: formatDate(reportDate),
        type: 'progress-report',
        title: `Weekly Progress Report ${i}`,
        description: 'Status update to client stakeholders',
        stakeholder: stakeholderList[0], // Maria (PM)
        tasks: ['Compile progress report', 'Share updates', 'Address questions'],
        completed: false,
        bufferDays: 0,
        aiNote: `📧 ${stakeholderList[0].name} prefers email updates - use formal documentation format`,
      });
    }

    // Add blocker review before final sprint
    const blockerReviewDate = subtractDays(signOffDateObj, 14);
    events.push({
      id: 'blocker-review',
      date: formatDate(blockerReviewDate),
      type: 'blocker-review',
      title: 'Blocker Resolution Checkpoint',
      description: 'Review and resolve any blocking issues before final sprint',
      tasks: ['Review open blockers', 'Assign resolution tasks', 'Set deadlines'],
      completed: false,
      bufferDays: 2,
      aiNote: '🚨 Reserved 2 days for blocker resolution before final sprint',
    });

    // Add requirements sign-off at the beginning
    events.push({
      id: 'requirements-signoff',
      date: formatDate(currentDate),
      type: 'client-meeting',
      title: 'Requirements Sign-Off',
      description: 'Final approval of project requirements and scope',
      stakeholder: stakeholderList[1], // Sarah (Technical Lead)
      approvalRequired: true,
      tasks: ['Present requirements doc', 'Get stakeholder approval', 'Document decisions'],
      completed: false,
      bufferDays: getBufferDays(stakeholderList[1].availability),
      aiNote: `📅 ${stakeholderList[1].name} prefers Tuesday/Wednesday meetings. ${stakeholderList[1].notes}`,
    });

    // Sort events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      events,
      stats: {
        totalDuration: Math.ceil((signOffDateObj - new Date(events[0].date)) / (24 * 60 * 60 * 1000)),
        clientMeetings: events.filter((e) => e.type === 'client-meeting').length,
        milestones: events.filter((e) => e.type === 'milestone').length,
        bufferDaysAdded: events.reduce((sum, e) => sum + (e.bufferDays || 0), 0),
        progressReports: events.filter((e) => e.type === 'progress-report').length,
      },
    };
  };

  const handleGenerateTimeline = () => {
    if (!signOffDate) {
      alert('Please select a sign-off date first');
      return;
    }

    const generatedTimeline = generateTimeline(signOffDate, plan?.milestones, stakeholders);
    setTimeline(generatedTimeline);
  };

  // Helper function for buffer days (used in UI)
  const getBufferDays = (availability) => {
    switch (availability) {
      case 'very-limited':
        return 6;
      case 'limited':
        return 4;
      case 'moderate':
        return 2;
      case 'high':
        return 1;
      default:
        return 2;
    }
  };

  // Blocker resolution handlers
  const handleResolveBlocker = (index) => {
    if (!resolvedBlockers.includes(index)) {
      setResolvedBlockers([...resolvedBlockers, index]);
    }
  };

  const handleLaterBlocker = (index) => {
    // Remove from resolved if it was marked as resolved
    setResolvedBlockers(resolvedBlockers.filter((i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create project with AI-generated data
      const projectData = {
        name: basicInfo.name,
        client: basicInfo.client || null,
        description: analysis.summary,
        tech_stack: techStack.map((t) => t.recommended),
        status: 'planning',
        health: 'on-track',
        progress: 0,
        created_by: userId,
      };

      const { data: project, error } = await supabaseHelpers.createProject(projectData);

      if (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project. Please try again.');
        return;
      }

      // Add creator as project member
      if (project && project[0]) {
        await supabase.from('project_members').insert([
          {
            project_id: project[0].id,
            user_id: userId,
            role: 'owner',
          },
        ]);

        // Create milestones from AI plan
        if (plan && plan.milestones) {
          const startDate = new Date();
          for (const milestone of plan.milestones) {
            const dueDate = new Date(startDate);
            dueDate.setDate(dueDate.getDate() + milestone.daysFromStart);

            await supabase.from('milestones').insert([
              {
                project_id: project[0].id,
                name: milestone.name,
                due_date: dueDate.toISOString().split('T')[0],
                confidence: milestone.confidence,
                status: 'upcoming',
              },
            ]);
          }
        }

        // Create blockers
        if (blockers && blockers.length > 0) {
          for (const blocker of blockers) {
            await supabase.from('blockers').insert([
              {
                project_id: project[0].id,
                title: blocker.title,
                description: blocker.description,
                severity: blocker.severity,
                status: 'active',
                created_by: userId,
              },
            ]);
          }
        }
      }

      if (onComplete && project) {
        onComplete(project[0]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return basicInfo.name.trim() !== '';
      case 2:
        return brief.trim() !== '';
      default:
        return true;
    }
  };

  if (loading) {
    const messages = {
      3: 'AI is analyzing your project brief...',
      4: 'AI is recommending technologies...',
      5: 'AI is generating your project plan...',
      6: 'AI is identifying potential blockers...',
    };
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <LoadingSpinner message={messages[currentStep + 1] || 'Processing...'} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-sm text-gray-500 mt-1">
              Let's set up your project with AI assistance
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px]">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-300 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Project Basics</h3>
                <p className="text-gray-600">Start with the essential information</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  placeholder="e.g., Student Bio Collection System"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client / Company
                </label>
                <input
                  type="text"
                  value={basicInfo.client}
                  onChange={(e) => setBasicInfo({ ...basicInfo, client: e.target.value })}
                  placeholder="e.g., Acme University"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Brief */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Project Brief</h3>
                <p className="text-gray-600">
                  Describe your project in detail. Our AI will analyze this to help structure your
                  project.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe what you're building, key requirements, goals, constraints, etc..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be as detailed as possible. Include requirements, goals, technical preferences,
                  and any constraints.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: AI Analysis */}
          {currentStep === 3 && analysis && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600">Here's what I understood from your brief</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">✨</span>
                  <div>
                    <h4 className="font-bold text-purple-900 mb-2">Project Summary</h4>
                    <p className="text-gray-700">{analysis.summary}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Core Deliverables</h4>
                  <button
                    onClick={handleAddDeliverable}
                    className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg font-medium border border-purple-200"
                  >
                    + Add Deliverable
                  </button>
                </div>
                <div className="space-y-3">
                  {analysis?.deliverables?.map((deliverable, index) => (
                    <div key={index}>
                      {editingDeliverable === index ? (
                        // Edit mode
                        <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 font-semibold"
                            placeholder="Deliverable title"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm"
                            rows={2}
                            placeholder="Deliverable description"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveDeliverable}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                            ✓
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{deliverable.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {deliverable.description}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditDeliverable(index)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                              title="Edit"
                            >
                              <span className="text-lg">✏️</span>
                            </button>
                            <button
                              onClick={() => handleRemoveDeliverable(index)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <span className="text-lg">🗑️</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReanalyze}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200"
                >
                  🔄 Re-analyze
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Tech Stack Recommendations */}
          {currentStep === 4 && techStack && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🛠️ Tech Stack Recommendations
                  </h3>
                  <p className="text-gray-600">
                    Based on your requirements, here's what we recommend
                  </p>
                </div>
                <button
                  onClick={handleAddTechStack}
                  className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg font-medium border border-purple-200"
                >
                  + Add Technology
                </button>
              </div>

              <div className="space-y-4">
                {techStack?.map((recommendation, index) => (
                  <div key={index}>
                    {editingTechStack === index ? (
                      // Edit mode
                      <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              value={techEditForm.category}
                              onChange={(e) =>
                                setTechEditForm({ ...techEditForm, category: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="e.g., Frontend, Backend, Database"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Technology Name
                            </label>
                            <input
                              type="text"
                              value={techEditForm.recommended}
                              onChange={(e) =>
                                setTechEditForm({ ...techEditForm, recommended: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                              placeholder="e.g., React, Node.js, PostgreSQL"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Reason
                            </label>
                            <textarea
                              value={techEditForm.reason}
                              onChange={(e) =>
                                setTechEditForm({ ...techEditForm, reason: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                              placeholder="Why this technology is recommended"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveTechStack}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={handleCancelTechEdit}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                              {recommendation.category}
                            </span>
                            <h4 className="text-2xl font-bold text-gray-900 mt-1">
                              {recommendation.recommended}
                            </h4>
                            <p className="text-gray-600 mt-2">{recommendation.reason}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 ml-4">
                            <button
                              onClick={() => handleEditTechStack(index)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleRemoveTechStack(index)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                              Alternatives (click to switch):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {recommendation.alternatives.map((alt, altIndex) => (
                                <button
                                  key={altIndex}
                                  onClick={() => handleSwitchToAlternative(index, alt)}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-600 hover:text-white transition-colors"
                                  title={`Switch to ${alt}`}
                                >
                                  {alt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRegenerateTechStack}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}

          {/* Step 5: AI-Generated Plan */}
          {currentStep === 5 && plan && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">📋 Project Plan</h3>
                  <p className="text-gray-600">AI-generated milestones and tasks</p>
                </div>
                <button
                  onClick={handleAddMilestone}
                  className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg font-medium border border-purple-200"
                >
                  + Add Milestone
                </button>
              </div>

              <div className="space-y-3">
                {plan?.milestones?.map((milestone, index) => {
                  const isExpanded = expandedMilestones.includes(index);
                  const completedCount = milestone.completedTasks?.length || 0;
                  const totalTasks = milestone.tasks?.length || 0;

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                    >
                      {editingMilestone === index ? (
                        // Edit milestone name mode
                        <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                          <input
                            type="text"
                            value={milestoneEditForm.name}
                            onChange={(e) =>
                              setMilestoneEditForm({ ...milestoneEditForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold mb-3"
                            placeholder="Milestone name"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveMilestone}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={handleCancelMilestoneEdit}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Milestone header */}
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                                  <p className="text-xs text-gray-500">
                                    {totalTasks} tasks · {completedCount} completed
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Confidence badge */}
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        milestone.confidence >= 80
                                          ? 'bg-green-500'
                                          : milestone.confidence >= 60
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                      }`}
                                      style={{ width: `${milestone.confidence}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600">
                                    {milestone.confidence}%
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleEditMilestone(index)}
                                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                                  title="Edit milestone name"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleRemoveMilestone(index)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Remove milestone"
                                >
                                  🗑️
                                </button>
                                <button
                                  onClick={() => toggleMilestone(index)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                  title={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                  {isExpanded ? '▲' : '▼'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded tasks */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                              <div className="space-y-2 mt-3">
                                {milestone.tasks?.map((task, taskIndex) => (
                                  <div
                                    key={taskIndex}
                                    className="flex items-center gap-2 group hover:bg-gray-50 rounded px-2 py-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={milestone.completedTasks?.includes(taskIndex) || false}
                                      onChange={() => handleToggleTask(index, taskIndex)}
                                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span
                                      className={`flex-1 text-sm ${
                                        milestone.completedTasks?.includes(taskIndex)
                                          ? 'line-through text-gray-400'
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {task}
                                    </span>
                                    <button
                                      onClick={() => handleRemoveTask(index, taskIndex)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-xs text-red-600 hover:bg-red-50 rounded"
                                      title="Remove task"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => handleAddTask(index)}
                                className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                              >
                                + Add Task
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRegeneratePlan}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}

          {/* Step 6: AI Timeline Planning */}
          {currentStep === 6 && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">🗓️ AI Timeline Planning</h3>
                  <p className="text-gray-600">
                    Intelligent scheduling based on stakeholder availability and project milestones
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimelineView('timeline')}
                    className={`px-3 py-1 text-sm rounded ${
                      timelineView === 'timeline'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setTimelineView('calendar')}
                    className={`px-3 py-1 text-sm rounded ${
                      timelineView === 'calendar'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Calendar
                  </button>
                </div>
              </div>

              {/* Sign-off date input */}
              {!timeline && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-4">Set Target Sign-Off Date</h4>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Sign-Off Date
                      </label>
                      <input
                        type="date"
                        value={signOffDate}
                        onChange={(e) => setSignOffDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      onClick={handleGenerateTimeline}
                      disabled={!signOffDate}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      🤖 Generate Timeline
                    </button>
                  </div>
                </div>
              )}

              {/* AI Insights Banner */}
              {timeline && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">🤖</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">AI Timeline Generated</h4>
                      <p className="text-purple-100">
                        Based on {stakeholders.length} stakeholders with varying availability, I've added{' '}
                        {timeline.stats.bufferDaysAdded} buffer days to account for response times and
                        scheduling constraints. The timeline includes {timeline.stats.clientMeetings} client
                        touchpoints and {timeline.stats.progressReports} progress reports.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Row */}
              {timeline && (
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{timeline.stats.totalDuration}</p>
                    <p className="text-xs text-gray-600">days</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Client Meetings</p>
                    <p className="text-2xl font-bold text-blue-600">{timeline.stats.clientMeetings}</p>
                    <p className="text-xs text-gray-600">scheduled</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Milestones</p>
                    <p className="text-2xl font-bold text-purple-600">{timeline.stats.milestones}</p>
                    <p className="text-xs text-gray-600">checkpoints</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Buffer Days</p>
                    <p className="text-2xl font-bold text-orange-600">{timeline.stats.bufferDaysAdded}</p>
                    <p className="text-xs text-gray-600">added</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Sign-Off Date</p>
                    <p className="text-lg font-bold text-green-600">{timeline.events[timeline.events.length - 1]?.date.split(',')[0]}</p>
                    <p className="text-xs text-gray-600">{timeline.events[timeline.events.length - 1]?.date.split(',')[1]}</p>
                  </div>
                </div>
              )}

              {/* Stakeholder Warnings */}
              {timeline && (
                <details className="bg-white border border-gray-200 rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
                    📋 Stakeholder Analysis ({stakeholders.length})
                  </summary>
                  <div className="p-4 pt-0 grid grid-cols-3 gap-4">
                    {stakeholders.map((stakeholder) => (
                      <div
                        key={stakeholder.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                            {stakeholder.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{stakeholder.name}</p>
                            <p className="text-xs text-gray-500">{stakeholder.role}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Availability:</span>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                stakeholder.availability === 'high'
                                  ? 'bg-green-100 text-green-700'
                                  : stakeholder.availability === 'moderate'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {stakeholder.availability}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Response Time:</span>
                            <span className="text-xs font-semibold">{stakeholder.responseTime}h avg</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            ⚠️ +{getBufferDays(stakeholder.availability)} days buffer recommended
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Timeline View */}
              {timeline && timelineView === 'timeline' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="space-y-6">
                    {timeline.events.map((event, index) => {
                      const getEventColor = (type) => {
                        switch (type) {
                          case 'milestone':
                            return 'purple';
                          case 'client-meeting':
                            return 'blue';
                          case 'progress-report':
                            return 'green';
                          case 'blocker-review':
                            return 'red';
                          case 'internal':
                            return 'gray';
                          default:
                            return 'gray';
                        }
                      };

                      const getEventIcon = (type) => {
                        switch (type) {
                          case 'milestone':
                            return '🎯';
                          case 'client-meeting':
                            return '👥';
                          case 'progress-report':
                            return '📊';
                          case 'blocker-review':
                            return '🚨';
                          case 'internal':
                            return '🔧';
                          default:
                            return '📌';
                        }
                      };

                      const color = getEventColor(event.type);
                      const icon = getEventIcon(event.type);
                      const isLast = index === timeline.events.length - 1;

                      // Get actual color classes (Tailwind doesn't support dynamic class names)
                      const getBgClass = (c) => {
                        const classes = {
                          purple: 'bg-purple-100 text-purple-600',
                          blue: 'bg-blue-100 text-blue-600',
                          green: 'bg-green-100 text-green-600',
                          red: 'bg-red-100 text-red-600',
                          gray: 'bg-gray-100 text-gray-600',
                        };
                        return classes[c] || classes.gray;
                      };

                      const getBorderClass = (c) => {
                        const classes = {
                          purple: 'border-purple-200 hover:border-purple-400',
                          blue: 'border-blue-200 hover:border-blue-400',
                          green: 'border-green-200 hover:border-green-400',
                          red: 'border-red-200 hover:border-red-400',
                          gray: 'border-gray-200 hover:border-gray-400',
                        };
                        return classes[c] || classes.gray;
                      };

                      return (
                        <div key={event.id} className="flex gap-4">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full ${getBgClass(color)} flex items-center justify-center text-xl ${
                                event.isFinal ? 'ring-4 ring-green-200' : ''
                              }`}
                            >
                              {icon}
                            </div>
                            {!isLast && (
                              <div className="w-0.5 flex-1 min-h-[40px] bg-gray-200 mt-2"></div>
                            )}
                          </div>

                          {/* Event card */}
                          <div className="flex-1 pb-6">
                            <div
                              className={`bg-white border-2 ${getBorderClass(color)} rounded-lg p-4 transition-all ${
                                event.isFinal ? 'ring-2 ring-green-300' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">{event.date}</p>
                                  <h4 className="font-bold text-gray-900">{event.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  {event.approvalRequired && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-semibold">
                                      Approval Required
                                    </span>
                                  )}
                                  {event.isFinal && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-semibold">
                                      🏁 Final
                                    </span>
                                  )}
                                </div>
                              </div>

                              {event.stakeholder && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                    {event.stakeholder.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-medium">{event.stakeholder.name}</span>
                                  <span className="text-gray-500">·</span>
                                  <span className="text-xs text-gray-500">{event.stakeholder.role}</span>
                                </div>
                              )}

                              {event.aiNote && (
                                <div className="mt-3 bg-purple-50 border border-purple-200 rounded p-3">
                                  <p className="text-sm text-purple-900">{event.aiNote}</p>
                                </div>
                              )}

                              {event.bufferDays > 0 && (
                                <div className="mt-3">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                    ⏱️ +{event.bufferDays} buffer days
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Calendar View Placeholder */}
              {timeline && timelineView === 'calendar' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-center text-gray-500 py-12">
                    Calendar view coming soon...
                  </p>
                </div>
              )}

              {/* Actions */}
              {timeline && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setTimeline(null);
                      setSignOffDate('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200"
                  >
                    🔄 Regenerate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Final Review */}
          {currentStep === 7 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Project Review & Launch
                </h3>
                <p className="text-gray-600">
                  Final review before creating your project
                </p>
              </div>

              {/* Project Summary Card */}
              <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {basicInfo.name}
                    </h2>
                    {basicInfo.client && (
                      <p className="text-gray-600">Client: {basicInfo.client}</p>
                    )}
                  </div>
                  {timeline && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Target Date</p>
                      <p className="text-xl font-bold text-purple-600">
                        {new Date(signOffDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                {timeline && (
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">📅</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {timeline.stats.totalDuration}
                      </div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {timeline.stats.milestones}
                      </div>
                      <div className="text-xs text-gray-600">Milestones</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">👥</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {timeline.stats.clientMeetings}
                      </div>
                      <div className="text-xs text-gray-600">Client Meetings</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">🛡️</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {timeline.stats.bufferDaysAdded}
                      </div>
                      <div className="text-xs text-gray-600">Buffer Days</div>
                    </div>
                  </div>
                )}

                {/* Tech Stack */}
                {techStack && techStack.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                        >
                          {tech.recommended}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Blockers Section */}
              {blockers && blockers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-600 text-xl">⚠️</span>
                    <h4 className="font-semibold text-gray-900">
                      Open Blockers & Items ({blockers.length - resolvedBlockers.length} remaining)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {blockers.map((blocker, index) => {
                      const isResolved = resolvedBlockers.includes(index);
                      const bgColor = blocker.severity === 'high'
                        ? 'bg-red-50'
                        : blocker.severity === 'medium'
                        ? 'bg-yellow-50'
                        : 'bg-gray-50';
                      const iconColor = blocker.severity === 'high'
                        ? 'text-red-600'
                        : blocker.severity === 'medium'
                        ? 'text-yellow-600'
                        : 'text-gray-600';
                      const icon = blocker.severity === 'high' ? '🔺' : '⚠️';

                      return (
                        <div
                          key={index}
                          className={`${bgColor} ${
                            isResolved ? 'opacity-50' : ''
                          } rounded-lg p-4 border ${
                            blocker.severity === 'high'
                              ? 'border-red-200'
                              : blocker.severity === 'medium'
                              ? 'border-yellow-200'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`text-xl ${iconColor} flex-shrink-0`}>
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900">
                                    {blocker.title}
                                  </h5>
                                  <p className="text-sm text-gray-600 italic mt-1">
                                    "{blocker.description}"
                                  </p>
                                </div>
                                <span
                                  className={`ml-3 text-xs font-bold uppercase px-2 py-1 rounded ${
                                    blocker.severity === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : blocker.severity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {blocker.severity}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleResolveBlocker(index)}
                                  disabled={isResolved}
                                  className={`px-4 py-1.5 ${
                                    isResolved
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  } rounded text-sm font-medium transition-colors disabled:cursor-not-allowed`}
                                >
                                  {isResolved ? '✓ Resolved' : 'Resolve'}
                                </button>
                                <button
                                  onClick={() => handleLaterBlocker(index)}
                                  className="px-4 py-1.5 bg-white text-gray-700 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50"
                                >
                                  Later
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-gray-600 font-medium">
                      {resolvedBlockers.length} of {blockers.length} resolved
                    </span>
                    <span className="text-gray-500">
                      Remaining items will become tasks
                    </span>
                  </div>
                </div>
              )}

              {/* Ready to Launch Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎉</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">Ready to Launch!</h4>
                    <p className="text-gray-700 mb-3">
                      Your project is configured with{' '}
                      <span className="font-semibold">{plan?.milestones?.length || 0} milestones</span>
                      {timeline && (
                        <>
                          , <span className="font-semibold">{timeline.stats.clientMeetings} scheduled client touchpoints</span>
                          , and{' '}
                          <span className="font-semibold">{timeline.stats.bufferDaysAdded} buffer days</span> for
                          stakeholder response times
                        </>
                      )}
                      .
                    </p>
                    {timeline && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Estimated Completion</span>
                        <span className="text-lg font-bold text-green-700">
                          {new Date(signOffDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-700 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            {currentStep < 7 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {currentStep === 2 ? '🤖 Analyze with AI' : 'Continue →'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>✓ Create Project</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
