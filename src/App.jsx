import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CopilotPanel from './components/layout/CopilotPanel';
import Dashboard from './components/dashboard/Dashboard';
import ProjectsView from './components/projects/ProjectsView';
import ProjectWizard from './components/projects/ProjectWizard';
import ProjectDetail from './components/projects/ProjectDetail';
import TasksView from './components/tasks/TasksView';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewContext, setViewContext] = useState({});
  const [showProjectWizard, setShowProjectWizard] = useState(false);

  const navigate = (view, context = {}) => {
    setCurrentView(view);
    setViewContext(context);
  };

  const handleNewProject = () => {
    setShowProjectWizard(true);
  };

  const handleProjectCreated = (project) => {
    setShowProjectWizard(false);
    navigate('project-detail', { projectId: project.id });
  };

  const handleSearch = (query) => {
    // Implement global search functionality
    console.log('Searching for:', query);
  };

  const getCopilotContext = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'projects':
        return 'Projects View';
      case 'project-detail':
        return `Project Details`;
      case 'my-tasks':
        return 'My Tasks';
      default:
        return currentView;
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;

      case 'projects':
        return <ProjectsView onNavigate={navigate} />;

      case 'project-wizard':
        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={handleNewProject}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Open Project Wizard
            </button>
          </div>
        );

      case 'project-detail':
        return (
          <ProjectDetail
            projectId={viewContext.projectId}
            onBack={() => navigate('projects')}
            onNavigate={navigate}
          />
        );

      case 'my-tasks':
        return <TasksView onNavigate={navigate} currentUserId={null} />;

      case 'timeline':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Timeline View</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        );

      case 'blockers':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Blockers</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Feed</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Construction</h2>
              <p className="text-gray-500">This feature is coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        currentView={currentView}
        setCurrentView={navigate}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar onNewProject={handleNewProject} onSearch={handleSearch} />

        {/* View Content */}
        <main className="flex-1 overflow-hidden">{renderView()}</main>
      </div>

      {/* Copilot Panel */}
      <CopilotPanel
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        currentContext={getCopilotContext()}
      />

      {/* Project Wizard Modal */}
      {showProjectWizard && (
        <ProjectWizard
          onClose={() => setShowProjectWizard(false)}
          onComplete={handleProjectCreated}
        />
      )}

      {/* Floating Copilot Button */}
      {!copilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-xl z-40"
          title="Open AI Copilot"
        >
          🤖
        </button>
      )}
    </div>
  );
}

export default App;
