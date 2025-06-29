import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Users, Calendar, Archive, CheckSquare, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

export function Dashboard() {
  const { state } = useApp();
  
  const stats = {
    totalClients: state.clients.length,
    weeklyPosts: state.plannerPosts.filter(post => {
      const postDate = new Date(post.date);
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return postDate >= weekStart && postDate < weekEnd;
    }).length,
    awaitingApproval: state.plannerPosts.filter(post => post.status === 'awaiting-approval').length + 
                     state.contentItems.filter(item => item.status === 'pending').length,
    totalTasks: state.tasks.length,
  };

  const quickAccessItems = [
    {
      title: 'Clients',
      description: 'Manage client profiles and information',
      icon: Users,
      link: '/clients',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
    },
    {
      title: 'Weekly Planner',
      description: 'Schedule and organize content posts',
      icon: Calendar,
      link: '/planner',
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary-700',
    },
    {
      title: 'Content Vault',
      description: 'Store and manage your content library',
      icon: Archive,
      link: '/content',
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
      textColor: 'text-success-700',
    },
    {
      title: 'Tasks',
      description: 'Manage client tasks and workflows',
      icon: CheckSquare,
      link: '/tasks',
      color: 'from-warning-500 to-warning-600',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-700',
    },
  ];

  const summaryTiles = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'This Week\'s Posts',
      value: stats.weeklyPosts,
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      title: 'Awaiting Approval',
      value: stats.awaitingApproval,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      description: 'Posts and content pending approval',
    },
    {
      title: 'Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Here's what's happening with your social media operations today.</p>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryTiles.map((tile, index) => {
          const Icon = tile.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{tile.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{tile.value}</p>
                  {tile.description && (
                    <p className="text-xs text-gray-500 mt-1">{tile.description}</p>
                  )}
                </div>
                <div className={`w-12 h-12 ${tile.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${tile.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.link}
                className={`group ${item.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-semibold ${item.textColor} mb-2`}>{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Link to="/planner" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All
          </Link>
        </div>
        
        {state.plannerPosts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
            <p className="text-gray-600 mb-4">Start by adding clients and scheduling posts</p>
            <Link
              to="/clients"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Your First Client
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {state.plannerPosts
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((post) => {
                const client = state.clients.find(c => c.id === post.clientId);
                return (
                  <div key={post.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        New {post.postType} post scheduled for {client?.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(post.createdAt)} - Status: {post.status}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.status === 'posted' ? 'bg-success-100 text-success-700' :
                      post.status === 'approved' ? 'bg-primary-100 text-primary-700' :
                      post.status === 'awaiting-approval' ? 'bg-warning-100 text-warning-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {post.status.replace('-', ' ')}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Awaiting Approval Section */}
      {stats.awaitingApproval > 0 && (
        <div className="mt-8 bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl border border-warning-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-warning-900">Items Awaiting Approval</h3>
                <p className="text-sm text-warning-700">Review and approve pending content and posts</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-warning-900">{stats.awaitingApproval}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Posts */}
            {state.plannerPosts.filter(post => post.status === 'awaiting-approval').length > 0 && (
              <Link
                to="/planner"
                className="bg-white rounded-lg p-4 border border-warning-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-warning-900">Planner Posts</p>
                    <p className="text-sm text-warning-700">
                      {state.plannerPosts.filter(post => post.status === 'awaiting-approval').length} posts pending
                    </p>
                  </div>
                  <Calendar className="w-5 h-5 text-warning-600 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            )}
            
            {/* Pending Content */}
            {state.contentItems.filter(item => item.status === 'pending').length > 0 && (
              <Link
                to="/content"
                className="bg-white rounded-lg p-4 border border-warning-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-warning-900">Content Items</p>
                    <p className="text-sm text-warning-700">
                      {state.contentItems.filter(item => item.status === 'pending').length} items pending
                    </p>
                  </div>
                  <Archive className="w-5 h-5 text-warning-600 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}