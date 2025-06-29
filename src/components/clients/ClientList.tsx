import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Search, Filter, Users, Calendar, AlertCircle, Edit, Trash2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

export function ClientList() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const allTags = Array.from(new Set(state.clients.flatMap(client => client.tags)));

  const filteredClients = state.clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterTag || client.tags.includes(filterTag);
    return matchesSearch && matchesFilter;
  });

  const getClientStatus = (client: any) => {
    const clientPosts = state.plannerPosts.filter(post => post.clientId === client.id);
    const today = new Date();
    const hasRecentPost = clientPosts.some(post => {
      const postDate = new Date(post.date);
      const diffDays = (today.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    
    return hasRecentPost ? 'up-to-date' : 'overdue';
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This will also delete all associated posts, content, and tasks.')) {
      dispatch({ type: 'DELETE_CLIENT', payload: clientId });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and information</p>
        </div>
        <Link
          to="/clients/new"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Client
        </Link>
      </div>

      {/* Client Status Reference */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 mb-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-3">Client Status Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-success-100 text-success-700 rounded-full">
                    Up to Date
                  </span>
                </div>
                <p className="text-blue-800">
                  <strong>✅ Active:</strong> Client has recent social media activity (posts within the last 7 days). No immediate action needed.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
                    Overdue
                  </span>
                </div>
                <p className="text-blue-800">
                  <strong>⚠️ Needs Attention:</strong> Client hasn't had any posts in the last 7 days. Schedule new content or follow up with client.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-blue-800">
                  <strong>🔄 In Progress:</strong> New client or pending work. Complete client brief and start content planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {state.clients.length === 0 ? 'No clients yet' : 'No clients found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {state.clients.length === 0 
              ? 'Add your first client to get started with managing social media operations'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {state.clients.length === 0 && (
            <Link
              to="/clients/new"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Client
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Client</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Business Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Tags</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Last Post</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const status = getClientStatus(client);
                  const lastPost = state.plannerPosts
                    .filter(post => post.clientId === client.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{client.businessType}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {client.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {client.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              +{client.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {lastPost ? formatDate(lastPost.date) : 'No posts'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          status === 'up-to-date' 
                            ? 'bg-success-100 text-success-700' 
                            : 'bg-warning-100 text-warning-700'
                        }`}>
                          {status === 'up-to-date' ? 'Up to Date' : 'Overdue'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/clients/${client.id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}