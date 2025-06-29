import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClientList } from './components/clients/ClientList';
import { ClientForm } from './components/clients/ClientForm';
import { WeeklyPlanner } from './components/planner/WeeklyPlanner';
import { ContentVault } from './components/content/ContentVault';
import { Tasks } from './components/tasks/Tasks';
import { QuickTools } from './components/tools/QuickTools';
import { Settings } from './components/settings/Settings';

function AppContent() {
  const { state } = useApp();

  if (!state.user) {
    return <LoginScreen />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientForm />} />
        <Route path="/planner" element={<WeeklyPlanner />} />
        <Route path="/content" element={<ContentVault />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tools" element={<QuickTools />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;