import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CopilotPanel from './components/layout/CopilotPanel';
import Dashboard from './components/dashboard/Dashboard';
import ProjectsView from './components/projects/ProjectsView';
import AIProjectWizard from './components/projects/AIProjectWizard';
import ProjectDetail from './components/projects/ProjectDetail';
import TasksView from './components/tasks/TasksView';
import ClientsPage from './components/clients/ClientsPage';
import StakeholdersPage from './components/stakeholders/StakeholdersPage';
import DocumentsView from './components/documents/DocumentsView';
import BlockersView from './components/blockers/BlockersView';
import TeamManagementView from './components/team/TeamManagementView';
import ReportsView from './components/reports/ReportsView';

function App() {
  const { user, loading, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewContext, setViewContext] = useState({});
  const [showProjectWizard, setShowProjectWizard] = useState(false);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

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

  const handleLogout = async () => {
    await signOut();
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
        return <TasksView onNavigate={navigate} currentUserId={user?.id} />;

      case 'documents':
        return <DocumentsView />;

      case 'blockers':
        return <BlockersView />;

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
        return <TeamManagementView />;

      case 'reports':
        return <ReportsView />;

      case 'clients':
        return <ClientsPage />;

      case 'stakeholders':
        return <StakeholdersPage />;

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
        user={user}
        onLogout={handleLogout}
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
        <AIProjectWizard
          onClose={() => setShowProjectWizard(false)}
          onComplete={handleProjectCreated}
          userId={user?.id}
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
