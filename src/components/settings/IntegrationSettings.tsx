import React, { useState } from 'react';
import { Link, ExternalLink, Plus, Settings, Globe, Database, Zap, Copy, Check } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  url: string;
  status: 'connected' | 'disconnected' | 'coming-soon';
  category: 'storage' | 'automation' | 'analytics' | 'communication';
}

export function IntegrationSettings() {
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  const integrations: Integration[] = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Store and access your content files, client assets, and documents',
      icon: Database,
      url: 'https://drive.google.com',
      status: 'disconnected',
      category: 'storage',
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Sync client data, content calendars, and performance metrics',
      icon: Globe,
      url: 'https://sheets.google.com',
      status: 'disconnected',
      category: 'storage',
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Manage client briefs, project documentation, and team collaboration',
      icon: Settings,
      url: 'https://notion.so',
      status: 'disconnected',
      category: 'storage',
    },
    {
      id: 'n8n',
      name: 'n8n Automation',
      description: 'Create automated workflows for content publishing and client notifications',
      icon: Zap,
      url: 'https://n8n.io',
      status: 'coming-soon',
      category: 'automation',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect MOA with 5000+ apps for seamless workflow automation',
      icon: Zap,
      url: 'https://zapier.com',
      status: 'coming-soon',
      category: 'automation',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates directly in your team channels',
      icon: Globe,
      url: 'https://slack.com',
      status: 'coming-soon',
      category: 'communication',
    },
  ];

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-success-100 text-success-700 rounded-full">
            Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Manual Setup
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
            Coming Soon
          </span>
        );
    }
  };

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'storage':
        return <Database className="w-5 h-5" />;
      case 'automation':
        return <Zap className="w-5 h-5" />;
      case 'analytics':
        return <Globe className="w-5 h-5" />;
      case 'communication':
        return <Settings className="w-5 h-5" />;
    }
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const categoryLabels = {
    storage: 'File Storage & Data',
    automation: 'Workflow Automation',
    analytics: 'Analytics & Reporting',
    communication: 'Team Communication',
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Link className="w-6 h-6 text-success-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Integration Settings</h2>
          <p className="text-sm text-gray-600">Connect external tools and services to enhance your workflow</p>
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Settings className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Manual Integration Setup</h3>
            <p className="text-blue-800 text-sm mb-4">
              Currently, all integrations require manual setup. Click the links below to access each service and set up your workflows manually. 
              Automated API integrations are coming soon!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="font-medium text-blue-900">Available Now</p>
                <p className="text-blue-700">Manual links to external services</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="font-medium text-blue-900">Coming Soon</p>
                <p className="text-blue-700">One-click API connections</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="font-medium text-blue-900">Future</p>
                <p className="text-blue-700">Advanced workflow automation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Categories */}
      <div className="space-y-8">
        {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
          <div key={category}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                {getCategoryIcon(category as Integration['category'])}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryIntegrations.map((integration) => {
                const Icon = integration.icon;
                
                return (
                  <div
                    key={integration.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                    <div className="flex items-center space-x-3">
                      {integration.status !== 'coming-soon' ? (
                        <>
                          <a
                            href={integration.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open {integration.name}
                          </a>
                          <button
                            onClick={() => copyToClipboard(integration.url, integration.id)}
                            className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {copiedUrl === integration.id ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Integration Setup Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Google Drive Setup</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Create a dedicated MOA folder</li>
              <li>• Organize by client subfolders</li>
              <li>• Share folder with team members</li>
              <li>• Use consistent naming conventions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Google Sheets Integration</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Create content calendar templates</li>
              <li>• Set up client data tracking</li>
              <li>• Use formulas for automation</li>
              <li>• Share with relevant stakeholders</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Notion Workspace</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Create client brief templates</li>
              <li>• Set up project tracking databases</li>
              <li>• Build team collaboration spaces</li>
              <li>• Integrate with calendar tools</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Future Automations</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Auto-sync content to social platforms</li>
              <li>• Automated client notifications</li>
              <li>• Performance data collection</li>
              <li>• Workflow trigger automation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}