import React, { useState } from 'react';
import { Zap, FileText, Users, CheckSquare, Sparkles, Send, Plus } from 'lucide-react';
import { PostTemplateGenerator } from './PostTemplateGenerator';
import { ClientBriefGenerator } from './ClientBriefGenerator';
import { TaskGenerator } from './TaskGenerator';

export function QuickTools() {
  const [activeTab, setActiveTab] = useState<'templates' | 'briefs' | 'tasks'>('templates');

  const tabs = [
    {
      id: 'templates' as const,
      label: 'Post Templates',
      icon: Sparkles,
      description: 'Generate post content with AI assistance',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      id: 'briefs' as const,
      label: 'Client Briefs',
      icon: Users,
      description: 'Create and manage client brief forms',
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      id: 'tasks' as const,
      label: 'Task Generator',
      icon: CheckSquare,
      description: 'Auto-generate task checklists',
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quick Tools</h1>
            <p className="text-gray-600">Streamline your workflow with automated generators</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-6 text-left transition-all duration-200 ${
                  isActive 
                    ? `${tab.bgColor} border-b-2 border-primary-500` 
                    : 'hover:bg-gray-50'
                } ${tab.id !== 'templates' ? 'border-l border-gray-200' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${tab.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                      {tab.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{tab.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {activeTab === 'templates' && <PostTemplateGenerator />}
        {activeTab === 'briefs' && <ClientBriefGenerator />}
        {activeTab === 'tasks' && <TaskGenerator />}
      </div>
    </div>
  );
}