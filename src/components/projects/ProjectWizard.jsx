import React, { useState } from 'react';
import { supabase, supabaseHelpers } from '@lib/supabase';

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
          className={`font-semibold ${
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

export default function ProjectWizard({ onClose, onComplete, userId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    start_date: '',
    end_date: '',
    tech_stack: [],
    team_members: [],
    milestones: [],
  });
  const [techInput, setTechInput] = useState('');
  const [milestoneInput, setMilestoneInput] = useState({ name: '', due_date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Project Basics', description: 'Name and description' },
    { id: 2, title: 'Timeline', description: 'Start and end dates' },
    { id: 3, title: 'Tech Stack', description: 'Technologies used' },
    { id: 4, title: 'Team', description: 'Assign team members' },
    { id: 5, title: 'Milestones', description: 'Key deliverables' },
    { id: 6, title: 'Review', description: 'Confirm and create' },
  ];

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTech = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      updateFormData('tech_stack', [...formData.tech_stack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTech = (tech) => {
    updateFormData(
      'tech_stack',
      formData.tech_stack.filter((t) => t !== tech)
    );
  };

  const addMilestone = () => {
    if (milestoneInput.name.trim()) {
      updateFormData('milestones', [
        ...formData.milestones,
        { ...milestoneInput, status: 'upcoming' },
      ]);
      setMilestoneInput({ name: '', due_date: '' });
    }
  };

  const removeMilestone = (index) => {
    updateFormData(
      'milestones',
      formData.milestones.filter((_, i) => i !== index)
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional fields
      case 5:
        return true; // Optional fields
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 6) {
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
      const projectData = {
        name: formData.name,
        client: formData.client || null,
        description: formData.description || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        tech_stack: formData.tech_stack.length > 0 ? formData.tech_stack : null,
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

      // Add creator as project member with owner role
      if (project && project[0]) {
        await supabase.from('project_members').insert([
          {
            project_id: project[0].id,
            user_id: userId,
            role: 'owner',
          },
        ]);
      }

      // Create milestones if any
      if (formData.milestones.length > 0 && project) {
        for (const milestone of formData.milestones) {
          await supabase.from('milestones').insert([
            {
              project_id: project[0].id,
              name: milestone.name,
              due_date: milestone.due_date || null,
              status: 'upcoming',
            },
          ]);
        }
      }

      if (onComplete) {
        onComplete(project[0]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
            {/* Steps Sidebar */}
            <div className="md:col-span-1 space-y-4">
              {steps.map((step) => (
                <WizardStep
                  key={step.id}
                  number={step.id}
                  title={step.title}
                  description={step.description}
                  active={currentStep === step.id}
                  completed={currentStep > step.id}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="md:col-span-3">
              {/* Step 1: Project Basics */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tell us about your project
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="e.g., Website Redesign"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client / Company
                    </label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => updateFormData('client', e.target.value)}
                      placeholder="e.g., Acme Corp"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe the project goals and scope..."
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Timeline */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Set project timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => updateFormData('start_date', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => updateFormData('end_date', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Tip:</strong> Setting realistic timelines helps with planning and
                      tracking progress.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Tech Stack */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Add technologies
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tech Stack
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                        placeholder="e.g., React, Node.js, PostgreSQL"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={addTech}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  {formData.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tech_stack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2"
                        >
                          {tech}
                          <button
                            onClick={() => removeTech(tech)}
                            className="text-purple-500 hover:text-purple-700"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Team */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Assign team members
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700">
                      ⚠️ Team member assignment will be available after the project is created.
                      You can add members from the project detail page.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Milestones */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Define milestones
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Milestone Name
                      </label>
                      <input
                        type="text"
                        value={milestoneInput.name}
                        onChange={(e) =>
                          setMilestoneInput({ ...milestoneInput, name: e.target.value })
                        }
                        placeholder="e.g., Alpha Release"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={milestoneInput.due_date}
                        onChange={(e) =>
                          setMilestoneInput({ ...milestoneInput, due_date: e.target.value })
                        }
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={addMilestone}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add Milestone
                      </button>
                    </div>
                  </div>
                  {formData.milestones.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {formData.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{milestone.name}</p>
                            {milestone.due_date && (
                              <p className="text-sm text-gray-500">
                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeMilestone(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Review */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Review and create
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">Name:</span> {formData.name}
                        </p>
                        {formData.client && (
                          <p>
                            <span className="text-gray-600">Client:</span> {formData.client}
                          </p>
                        )}
                        {formData.description && (
                          <p>
                            <span className="text-gray-600">Description:</span>{' '}
                            {formData.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {(formData.start_date || formData.end_date) && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                        <div className="space-y-2 text-sm">
                          {formData.start_date && (
                            <p>
                              <span className="text-gray-600">Start:</span>{' '}
                              {new Date(formData.start_date).toLocaleDateString()}
                            </p>
                          )}
                          {formData.end_date && (
                            <p>
                              <span className="text-gray-600">End:</span>{' '}
                              {new Date(formData.end_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.tech_stack.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.tech_stack.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.milestones.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Milestones</h4>
                        <div className="space-y-2">
                          {formData.milestones.map((milestone, index) => (
                            <p key={index} className="text-sm text-gray-700">
                              • {milestone.name}
                              {milestone.due_date &&
                                ` - ${new Date(milestone.due_date).toLocaleDateString()}`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
