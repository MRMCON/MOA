import React, { useState } from 'react';
import { Download, Database, FileText, Calendar, Archive, Users, CheckSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  dataType: 'clients' | 'posts' | 'content' | 'tasks' | 'all';
  format: 'json' | 'csv';
}

export function DataExport() {
  const { state } = useApp();
  const [isExporting, setIsExporting] = useState<string>('');

  const exportOptions: ExportOption[] = [
    {
      id: 'clients-json',
      name: 'Clients Data (JSON)',
      description: 'Complete client information including contact details, tags, and notes',
      icon: Users,
      dataType: 'clients',
      format: 'json',
    },
    {
      id: 'clients-csv',
      name: 'Clients Data (CSV)',
      description: 'Client list in spreadsheet format for easy import to other tools',
      icon: Users,
      dataType: 'clients',
      format: 'csv',
    },
    {
      id: 'posts-json',
      name: 'Planner Posts (JSON)',
      description: 'All scheduled posts with dates, content, and status information',
      icon: Calendar,
      dataType: 'posts',
      format: 'json',
    },
    {
      id: 'posts-csv',
      name: 'Planner Posts (CSV)',
      description: 'Post schedule in spreadsheet format for calendar imports',
      icon: Calendar,
      dataType: 'posts',
      format: 'csv',
    },
    {
      id: 'content-json',
      name: 'Content Vault (JSON)',
      description: 'Complete content library with captions, tags, and metadata',
      icon: Archive,
      dataType: 'content',
      format: 'json',
    },
    {
      id: 'content-csv',
      name: 'Content Vault (CSV)',
      description: 'Content inventory in spreadsheet format for analysis',
      icon: Archive,
      dataType: 'content',
      format: 'csv',
    },
    {
      id: 'tasks-json',
      name: 'Tasks Data (JSON)',
      description: 'All tasks with assignments, due dates, and completion status',
      icon: CheckSquare,
      dataType: 'tasks',
      format: 'json',
    },
    {
      id: 'tasks-csv',
      name: 'Tasks Data (CSV)',
      description: 'Task list in spreadsheet format for project management tools',
      icon: CheckSquare,
      dataType: 'tasks',
      format: 'csv',
    },
    {
      id: 'complete-backup',
      name: 'Complete Backup (JSON)',
      description: 'Full system backup including all data and settings',
      icon: Database,
      dataType: 'all',
      format: 'json',
    },
  ];

  const getDataForExport = (dataType: ExportOption['dataType']) => {
    switch (dataType) {
      case 'clients':
        return state.clients;
      case 'posts':
        return state.plannerPosts;
      case 'content':
        return state.contentItems;
      case 'tasks':
        return state.tasks;
      case 'all':
        return {
          clients: state.clients,
          plannerPosts: state.plannerPosts,
          contentItems: state.contentItems,
          tasks: state.tasks,
          exportDate: new Date().toISOString(),
          version: '1.0',
        };
      default:
        return [];
    }
  };

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(item => {
      return headers.map(header => {
        const value = item[header];
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',');
    });
    return [csvHeaders, ...csvRows].join('\n');
  };

  const getCSVHeaders = (dataType: ExportOption['dataType']) => {
    switch (dataType) {
      case 'clients':
        return ['id', 'name', 'email', 'phone', 'businessType', 'website', 'notes', 'tags', 'createdAt', 'status'];
      case 'posts':
        return ['id', 'clientId', 'date', 'dayOfWeek', 'postType', 'title', 'notes', 'captionText', 'status', 'createdAt'];
      case 'content':
        return ['id', 'clientId', 'title', 'caption', 'image', 'tags', 'status', 'createdBy', 'createdAt'];
      case 'tasks':
        return ['id', 'clientId', 'description', 'status', 'dueDate', 'assignedTo', 'createdAt'];
      default:
        return [];
    }
  };

  const handleExport = async (option: ExportOption) => {
    setIsExporting(option.id);

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const data = getDataForExport(option.dataType);
      let content: string;
      let filename: string;
      let mimeType: string;

      if (option.format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `moa-${option.dataType}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        const headers = getCSVHeaders(option.dataType);
        content = convertToCSV(Array.isArray(data) ? data : [], headers);
        filename = `moa-${option.dataType}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting('');
    }
  };

  const getDataCount = (dataType: ExportOption['dataType']) => {
    switch (dataType) {
      case 'clients':
        return state.clients.length;
      case 'posts':
        return state.plannerPosts.length;
      case 'content':
        return state.contentItems.length;
      case 'tasks':
        return state.tasks.length;
      case 'all':
        return state.clients.length + state.plannerPosts.length + state.contentItems.length + state.tasks.length;
      default:
        return 0;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Download className="w-6 h-6 text-warning-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Backup & Export</h2>
          <p className="text-sm text-gray-600">Export your data for backup or migration purposes</p>
        </div>
      </div>

      {/* Data Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-8 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4">Your Data Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">{state.clients.length}</p>
            <p className="text-sm text-blue-700">Clients</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">{state.plannerPosts.length}</p>
            <p className="text-sm text-blue-700">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">{state.contentItems.length}</p>
            <p className="text-sm text-blue-700">Content Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-900">{state.tasks.length}</p>
            <p className="text-sm text-blue-700">Tasks</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const dataCount = getDataCount(option.dataType);
          const isCurrentlyExporting = isExporting === option.id;
          
          return (
            <div
              key={option.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1">{option.name}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {dataCount} {dataCount === 1 ? 'item' : 'items'}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full uppercase">
                  {option.format}
                </span>
              </div>

              <button
                onClick={() => handleExport(option)}
                disabled={isCurrentlyExporting || dataCount === 0}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-warning-600 text-white rounded-lg hover:bg-warning-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isCurrentlyExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {option.format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Export Information */}
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Important Export Information</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>• <strong>JSON Format:</strong> Complete data with all fields, ideal for backup and migration</p>
              <p>• <strong>CSV Format:</strong> Spreadsheet-compatible format, some complex data may be simplified</p>
              <p>• <strong>Images:</strong> Only image URLs are exported, not the actual image files</p>
              <p>• <strong>Privacy:</strong> All exports are generated locally in your browser</p>
              <p>• <strong>Backup Frequency:</strong> We recommend exporting your data weekly for safety</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Information */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Data Restoration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Currently, data restoration must be done manually. In future versions, you'll be able to import JSON backups directly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Manual Restoration Steps</h4>
            <ol className="space-y-1 text-gray-600 list-decimal list-inside">
              <li>Export your current data as backup</li>
              <li>Clear browser data if needed</li>
              <li>Manually re-enter critical information</li>
              <li>Use exported CSV files as reference</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Coming Soon</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• One-click JSON import</li>
              <li>• Selective data restoration</li>
              <li>• Automatic backup scheduling</li>
              <li>• Cloud backup integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}