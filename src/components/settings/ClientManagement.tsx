import React from 'react';
import { Users, Plus, Edit, Trash2, ExternalLink, BarChart3, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

export function ClientManagement() {
  const { state, dispatch } = useApp();

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete ${clientName}? This will also delete all associated posts, content, and tasks.`)) {
      dispatch({ type: 'DELETE_CLIENT', payload: clientId });
    }
  };

  const getClientStats = (clientId: string) => {
    const posts = state.plannerPosts.filter(post => post.clientId === clientId).length;
    const content = state.contentItems.filter(item => item.clientId === clientId).length;
    const tasks = state.tasks.filter(task => task.clientId === clientId).length;
    
    return { posts, content, tasks };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-secondary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Client Management</h2>
            <p className="text-sm text-gray-600">Quick access to client management tools and overview</p>
          </div>
        </div>
        <Link
          to="/clients/new"
          className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Client
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-600 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-primary-900">{state.clients.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-lg p-6 border border-success-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-600 text-sm font-medium">Active This Week</p>
              <p className="text-2xl font-bold text-success-900">
                {state.clients.filter(client => {
                  const clientPosts = state.plannerPosts.filter(post => post.clientId === client.id);
                  const thisWeek = clientPosts.some(post => {
                    const postDate = new Date(post.date);
                    const now = new Date();
                    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return postDate >= weekStart && postDate < weekEnd;
                  });
                  return thisWeek;
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-success-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-warning-50 to-warning-100 rounded-lg p-6 border border-warning-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warning-600 text-sm font-medium">Need Attention</p>
              <p className="text-2xl font-bold text-warning-900">
                {state.clients.filter(client => {
                  const clientPosts = state.plannerPosts.filter(post => post.clientId === client.id);
                  const hasRecentPost = clientPosts.some(post => {
                    const postDate = new Date(post.date);
                    const diffDays = (new Date().getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
                    return diffDays <= 7;
                  });
                  return !hasRecentPost;
                }).length}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-warning-600" />
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Clients</h3>
            <Link
              to="/clients"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View Full Client List
              <ExternalLink className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {state.clients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-6">Add your first client to get started with managing social media operations</p>
            <Link
              to="/clients/new"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Client
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {state.clients.slice(0, 5).map((client) => {
              const stats = getClientStats(client.id);
              
              return (
                <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{client.name}</h4>
                        <p className="text-sm text-gray-600">{client.businessType}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{stats.posts} posts</span>
                          <span className="text-xs text-gray-500">{stats.content} content items</span>
                          <span className="text-xs text-gray-500">{stats.tasks} tasks</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/clients/${client.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit Client"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {client.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {client.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          +{client.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {state.clients.length > 5 && (
              <div className="p-4 bg-gray-50 text-center">
                <Link
                  to="/clients"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View {state.clients.length - 5} more clients →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-lg p-6 border border-secondary-200">
          <h3 className="font-semibold text-secondary-900 mb-3">Bulk Actions</h3>
          <p className="text-sm text-secondary-700 mb-4">Perform actions on multiple clients at once</p>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-200 rounded-lg transition-colors">
              Export all client data
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-200 rounded-lg transition-colors">
              Send bulk notifications
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-200 rounded-lg transition-colors">
              Generate client reports
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-lg p-6 border border-success-200">
          <h3 className="font-semibold text-success-900 mb-3">Quick Links</h3>
          <p className="text-sm text-success-700 mb-4">Navigate to related sections</p>
          <div className="space-y-2">
            <Link
              to="/planner"
              className="block w-full text-left px-3 py-2 text-sm text-success-700 hover:bg-success-200 rounded-lg transition-colors"
            >
              Weekly Planner
            </Link>
            <Link
              to="/content"
              className="block w-full text-left px-3 py-2 text-sm text-success-700 hover:bg-success-200 rounded-lg transition-colors"
            >
              Content Vault
            </Link>
            <Link
              to="/tools"
              className="block w-full text-left px-3 py-2 text-sm text-success-700 hover:bg-success-200 rounded-lg transition-colors"
            >
              Quick Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}