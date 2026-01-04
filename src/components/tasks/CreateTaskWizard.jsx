import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';
import TaskDescriptionStep from './TaskDescriptionStep';
import TaskSetupStep from './TaskSetupStep';
import TaskIntegrationsStep from './TaskIntegrationsStep';

const CreateTaskWizard = ({ onClose, onCreate, projectId, defaultMilestone = null }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [taskData, setTaskData] = useState({
    // Step 1: Description
    title: '',
    description: '',

    // Step 2: Setup
    milestone_id: defaultMilestone,
    assigned_to: null,
    priority: 'medium',
    due_date: null,
    estimated_hours: null,
    tags: [],
    subtasks: [],

    // Step 3: Integrations
    integrations: {
      github: false,
      makecom: false,
      emailAssignee: true,
      postToSlack: false,
      addToCalendar: false,
      dueDateReminder: true,
    },
  });
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      // Simulate AI analysis
      setAiAnalyzing(true);
      setTimeout(() => {
        setAiAnalyzing(false);
        setCurrentStep(2);
      }, 1500);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCreateTask = async () => {
    setCreating(true);

    const newTask = {
      project_id: projectId,
      title: taskData.title,
      description: taskData.description || null,
      milestone_id: taskData.milestone_id || null,
      assigned_to: taskData.assigned_to || null,
      priority: taskData.priority,
      status: 'to-do',
      due_date: taskData.due_date ? new Date(taskData.due_date).toISOString() : null,
      estimated_hours: taskData.estimated_hours || null,
      tags: taskData.tags,
      created_by: user.id,
    };

    const { data, error } = await supabaseHelpers.createTask(newTask);

    if (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
      setCreating(false);
      return;
    }

    // Create subtasks if any
    if (taskData.subtasks.length > 0 && data && data[0]) {
      for (const subtask of taskData.subtasks) {
        await supabaseHelpers.createTask({
          project_id: projectId,
          title: subtask.title,
          parent_task_id: data[0].id,
          status: 'to-do',
          created_by: user.id,
        });
      }
    }

    // TODO: Handle integrations (email, slack, calendar, etc.)
    // This would be implemented based on your integration setup

    setCreating(false);
    onCreate(data[0]);
  };

  const updateTaskData = (updates) => {
    setTaskData({ ...taskData, ...updates });
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return taskData.title.trim().length > 0;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              {currentStep === 1 ? (
                <span className="text-xl">📋</span>
              ) : currentStep === 2 ? (
                <span className="text-xl">✨</span>
              ) : (
                <span className="text-xl">🔗</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {currentStep === 1 && 'Describe Your Task'}
                {currentStep === 2 && 'AI-Powered Setup'}
                {currentStep === 3 && 'Integrations'}
              </h2>
              <p className="text-sm text-gray-500">
                Step {currentStep} of 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* AI Analyzing Overlay */}
        {aiAnalyzing && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analyzing with AI...
              </h3>
              <p className="text-sm text-gray-500">
                Suggesting assignees, estimates, and priorities
              </p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <TaskDescriptionStep
              taskData={taskData}
              updateTaskData={updateTaskData}
            />
          )}
          {currentStep === 2 && (
            <TaskSetupStep
              taskData={taskData}
              updateTaskData={updateTaskData}
              projectId={projectId}
            />
          )}
          {currentStep === 3 && (
            <TaskIntegrationsStep
              taskData={taskData}
              updateTaskData={updateTaskData}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* Progress Dots */}
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step === currentStep
                    ? 'bg-purple-600 w-6'
                    : step < currentStep
                    ? 'bg-purple-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={creating}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                ← Back
              </button>
            )}
            {currentStep === 1 && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {currentStep === 1 ? (
                  <>
                    <span>✨</span>
                    <span>Analyze with AI</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <span>→</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCreateTask}
                disabled={creating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Create Task</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskWizard;
