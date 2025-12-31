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

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Name and description' },
    { id: 2, title: 'Brief', description: 'Project details' },
    { id: 3, title: 'Analysis', description: 'AI analyzes requirements' },
    { id: 4, title: 'Tech Stack', description: 'Technology recommendations' },
    { id: 5, title: 'Plan', description: 'AI-generated milestones' },
    { id: 6, title: 'Blockers', description: 'Potential issues' },
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
                <h4 className="font-semibold text-gray-900 mb-4">Core Deliverables</h4>
                <div className="space-y-3">
                  {analysis?.deliverables?.map((deliverable, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{deliverable.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                      </div>
                      <button className="text-gray-400 hover:text-purple-600">
                        <span className="text-lg">✏️</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  ✓ Looks Right
                </button>
                <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium border border-purple-200">
                  ✏️ Edit
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200">
                  🔄 Re-analyze
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Tech Stack Recommendations */}
          {currentStep === 4 && techStack && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🛠️ Tech Stack Recommendations
                </h3>
                <p className="text-gray-600">
                  Based on your requirements, here's what we recommend
                </p>
              </div>

              <div className="space-y-4">
                {techStack?.map((recommendation, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all"
                  >
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
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex-shrink-0 ml-4">
                        ✓ Use This
                      </button>
                    </div>

                    {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Alternatives:</p>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.alternatives.map((alt, altIndex) => (
                            <button
                              key={altIndex}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors"
                            >
                              {alt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  ✓ Approve Recommendations
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200">
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}

          {/* Step 5: AI-Generated Plan */}
          {currentStep === 5 && plan && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">📋 Project Plan</h3>
                <p className="text-gray-600">
                  AI-generated milestones and timeline for your project
                </p>
              </div>

              <div className="space-y-4">
                {plan?.milestones?.map((milestone, index) => {
                  const isFirst = index === 0;
                  const isLast = index === plan.milestones.length - 1;

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                isFirst
                                  ? 'bg-green-500 text-white'
                                  : 'bg-purple-100 text-purple-600'
                              }`}
                            >
                              {index + 1}
                            </div>
                            {!isLast && (
                              <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900">
                              {milestone.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Day {milestone.daysFromStart} from project start
                            </p>
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-600">
                                  Confidence:
                                </span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                                  <div
                                    className={`h-full rounded-full ${
                                      milestone.confidence >= 80
                                        ? 'bg-green-500'
                                        : milestone.confidence >= 60
                                        ? 'bg-yellow-500'
                                        : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${milestone.confidence}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                  {milestone.confidence}%
                                </span>
                              </div>
                            </div>
                            <ul className="mt-4 space-y-2">
                              {milestone.tasks?.map((task, taskIndex) => (
                                <li
                                  key={taskIndex}
                                  className="flex items-start gap-2 text-sm text-gray-700"
                                >
                                  <span className="text-purple-500 mt-0.5">▸</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  ✓ Approve Plan
                </button>
                <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium border border-purple-200">
                  ✏️ Adjust
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium border border-gray-200">
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Blockers & Review */}
          {currentStep === 6 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ⚠️ Potential Blockers
                </h3>
                <p className="text-gray-600">
                  Here are some items that need attention before starting
                </p>
              </div>

              <div className="space-y-3">
                {blockers?.map((blocker, index) => (
                  <div
                    key={index}
                    className="bg-white border-l-4 rounded-lg p-4 flex items-start gap-4"
                    style={{
                      borderLeftColor:
                        blocker.severity === 'high'
                          ? '#EF4444'
                          : blocker.severity === 'medium'
                          ? '#F59E0B'
                          : '#6B7280',
                    }}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        blocker.severity === 'high'
                          ? 'bg-red-100 text-red-600'
                          : blocker.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {blocker.severity === 'high'
                        ? '🔴'
                        : blocker.severity === 'medium'
                        ? '🟡'
                        : '⚪'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{blocker.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{blocker.description}</p>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase px-2 py-1 rounded ${
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
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 font-medium">
                          📌 Decide Now
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 font-medium">
                          ✓ Create Task
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mt-8">
                <h4 className="font-bold text-gray-900 mb-4">📊 Project Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Project Name</p>
                    <p className="font-semibold text-gray-900">{basicInfo.name}</p>
                  </div>
                  {basicInfo.client && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Client</p>
                      <p className="font-semibold text-gray-900">{basicInfo.client}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Deliverables</p>
                    <p className="font-semibold text-gray-900">
                      {analysis?.deliverables?.length || 0} items
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Technologies</p>
                    <p className="font-semibold text-gray-900">{techStack?.length || 0} tools</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Milestones</p>
                    <p className="font-semibold text-gray-900">
                      {plan?.milestones?.length || 0} phases
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Blockers</p>
                    <p className="font-semibold text-gray-900">{blockers?.length || 0} items</p>
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
            {currentStep < 6 ? (
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
