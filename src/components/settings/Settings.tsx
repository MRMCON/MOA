import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Users, Link, Download, Shield, Key, ExternalLink, Database } from 'lucide-react';
import { AdminProfile } from './AdminProfile';
import { ClientManagement } from './ClientManagement';
import { IntegrationSettings } from './IntegrationSettings';
import { DataExport } from './DataExport';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'clients' | 'integrations' | 'export'>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Admin Profile',
      icon: User,
      description: 'Manage your account settings and preferences',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      id: 'clients' as const,
      label: 'Client Management',
      icon: Users,
      description: 'Quick access to client management tools',
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      id: 'integrations' as const,
      label: 'Integrations',
      icon: Link,
      description: 'Connect external tools and services',
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
    },
    {
      id: 'export' as const,
      label: 'Backup & Export',
      icon: Download,
      description: 'Export and backup your data',
      color: 'from-warning-500 to-warning-600',
      bgColor: 'bg-warning-50',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account, integrations, and data</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-6 text-left transition-all duration-200 ${
                  isActive 
                    ? `${tab.bgColor} border-b-2 border-primary-500` 
                    : 'hover:bg-gray-50'
                } ${index > 0 ? 'border-l border-gray-200' : ''}`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${tab.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                      {tab.label}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{tab.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {activeTab === 'profile' && <AdminProfile />}
        {activeTab === 'clients' && <ClientManagement />}
        {activeTab === 'integrations' && <IntegrationSettings />}
        {activeTab === 'export' && <DataExport />}
      </div>
    </div>
  );
}