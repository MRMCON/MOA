import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

interface TaskTemplate {
  id: string;
  name: string;
  tasks: string[];
}

export function TaskGenerator() {
  const { state, dispatch } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const taskTemplates: TaskTemplate[] = [
    {
      id: 'info-post',
      name: 'Info Post',
      tasks: [
        'Research topic and gather information',
        'Write engaging caption copy',
        'Design visual or select stock image',
        'Review content for accuracy',
        'Schedule post for optimal timing',
        'Monitor engagement and respond to comments'
      ]
    },
    {
      id: 'product-promo',
      name: 'Product Promotion',
      tasks: [
        'Gather product details and specifications',
        'Take high-quality product photos',
        'Write compelling product description',
        'Create promotional graphics',
        'Set up tracking links',
        'Send for client approval',
        'Schedule across all platforms',
        'Monitor sales and engagement metrics'
      ]
    },
    {
      id: 'facebook-ad',
      name: 'Facebook Ad Campaign',
      tasks: [
        'Define target audience and demographics',
        'Create ad copy variations (A/B test)',
        'Design ad visuals (multiple formats)',
        'Set up Facebook Ads Manager campaign',
        'Configure budget and bidding strategy',
        'Install Facebook Pixel tracking',
        'Launch campaign',
        'Monitor performance daily',
        'Optimize based on results',
        'Prepare performance report'
      ]
    },
    {
      id: 'content-series',
      name: 'Content Series',
      tasks: [
        'Plan series theme and structure',
        'Create content calendar',
        'Write all captions in advance',
        'Design consistent visual templates',
        'Create series hashtag strategy',
        'Schedule all posts',
        'Prepare engagement strategy',
        'Monitor series performance',
        'Analyze overall series success'
      ]
    },
    {
      id: 'event-promotion',
      name: 'Event Promotion',
      tasks: [
        'Gather event details and logistics',
        'Create event announcement post',
        'Design event graphics and banners',
        'Set up event page/registration',
        'Create countdown posts',
        'Develop hashtag strategy',
        'Schedule reminder posts',
        'Create day-of-event content',
        'Post live updates during event',
        'Share post-event highlights'
      ]
    },
    {
      id: 'brand-awareness',
      name: 'Brand Awareness Campaign',
      tasks: [
        'Define brand messaging and voice',
        'Create brand story content',
        'Design brand visual assets',
        'Plan multi-platform strategy',
        'Create behind-the-scenes content',
        'Develop user-generated content campaign',
        'Engage with brand mentions',
        'Track brand sentiment',
        'Measure reach and impressions'
      ]
    }
  ];

  const generateTasks = () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const template = taskTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setCustomTasks([...template.tasks]);
      }
      setIsGenerating(false);
    }, 1000);
  };

  const addCustomTask = () => {
    if (newTask.trim()) {
      setCustomTasks(prev => [...prev, newTask.trim()]);
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setCustomTasks(prev => prev.filter((_, i) => i !== index));
  };

  const saveTasksToClient = () => {
    if (!selectedClientId || customTasks.length === 0) {
      alert('Please select a client and generate tasks first');
      return;
    }

    const client = state.clients.find(c => c.id === selectedClientId);
    const templateName = taskTemplates.find(t => t.id === selectedTemplate)?.name || 'Custom Tasks';

    // Create tasks for the selected client
    customTasks.forEach((taskDescription, index) => {
      const task = {
        id: `${Date.now()}-${index}`,
        clientId: selectedClientId,
        description: taskDescription,
        status: 'pending' as const,
        dueDate: '',
        assignedTo: '',
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TASK', payload: task });
    });

    alert(`${customTasks.length} tasks created for ${client?.name} (${templateName})`);
    
    // Reset form
    setCustomTasks([]);
    setSelectedTemplate('');
  };

  const editTask = (index: number, newText: string) => {
    setCustomTasks(prev => prev.map((task, i) => i === index ? newText : task));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CheckSquare className="w-6 h-6 text-success-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Task Generator</h2>
            <p className="text-sm text-gray-600">Auto-generate task checklists for different content types</p>
          </div>
        </div>
        
        {/* Quick Link to Tasks Module */}
        <Link
          to="/tasks"
          className="inline-flex items-center px-3 py-2 text-sm bg-warning-100 text-warning-700 rounded-lg hover:bg-warning-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage Tasks
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Template Selection */}
        <div className="space-y-6">
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
              Content Type Template *
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a template</option>
              {taskTemplates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Client *
            </label>
            <select
              id="client"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a client</option>
              {state.clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={generateTasks}
            disabled={!selectedTemplate || isGenerating}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-lg hover:from-success-600 hover:to-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating Tasks...
              </>
            ) : (
              <>
                <CheckSquare className="w-5 h-5 mr-2" />
                Generate Task List
              </>
            )}
          </button>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {taskTemplates.find(t => t.id === selectedTemplate)?.name} Template
              </h3>
              <div className="space-y-2">
                {taskTemplates.find(t => t.id === selectedTemplate)?.tasks.map((task, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-4 h-4 border border-gray-300 rounded mt-0.5 flex-shrink-0"></div>
                    <span className="text-gray-700">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generated Tasks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Generated Tasks</h3>
            {customTasks.length > 0 && (
              <span className="text-sm text-gray-600">{customTasks.length} tasks</span>
            )}
          </div>

          {customTasks.length > 0 ? (
            <div className="space-y-3">
              {customTasks.map((task, index) => (
                <div key={index} className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 border-2 border-success-300 rounded mt-0.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <textarea
                        value={task}
                        onChange={(e) => editTask(index, e.target.value)}
                        className="w-full text-sm text-gray-700 bg-transparent border-none resize-none focus:outline-none focus:ring-0 p-0"
                        rows={Math.ceil(task.length / 60)}
                      />
                    </div>
                    <button
                      onClick={() => removeTask(index)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Custom Task */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                    placeholder="Add a custom task..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={addCustomTask}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Save Tasks */}
              <div className="flex gap-3">
                <button
                  onClick={saveTasksToClient}
                  disabled={!selectedClientId}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Tasks to Client
                </button>
                
                <Link
                  to="/tasks"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View All Tasks
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Generated</h3>
              <p className="text-gray-600">Select a template and click generate to create your task list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}