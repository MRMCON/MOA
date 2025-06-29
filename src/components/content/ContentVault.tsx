import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Search, Filter, Grid, List, Upload, Edit, Trash2, Eye, Tag, User, Calendar, ExternalLink } from 'lucide-react';
import { ContentItem } from '../../types';
import { ContentModal } from './ContentModal';
import { ContentCard } from './ContentCard';
import { ContentListView } from './ContentListView';
import { Link } from 'react-router-dom';

export function ContentVault() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // Get all unique tags from content items
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    state.contentItems.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [state.contentItems]);

  // Filter content items
  const filteredContent = useMemo(() => {
    return state.contentItems.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesClient = !selectedClient || item.clientId === selectedClient;
      const matchesTag = !selectedTag || item.tags.includes(selectedTag);
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      
      return matchesSearch && matchesClient && matchesTag && matchesStatus;
    });
  }, [state.contentItems, searchTerm, selectedClient, selectedTag, selectedStatus]);

  // Content statistics
  const contentStats = useMemo(() => {
    const total = filteredContent.length;
    const byStatus = filteredContent.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      ideas: byStatus.idea || 0,
      ready: byStatus.ready || 0,
      pending: byStatus.pending || 0,
      used: byStatus.used || 0,
    };
  }, [filteredContent]);

  // Get ready content count for planner integration
  const readyContentCount = useMemo(() => {
    return state.contentItems.filter(item => 
      item.status === 'ready' || item.status === 'pending'
    ).length;
  }, [state.contentItems]);

  const handleAddContent = () => {
    setSelectedContent(null);
    setIsModalOpen(true);
  };

  const handleEditContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleDeleteContent = (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content item?')) {
      dispatch({ type: 'DELETE_CONTENT_ITEM', payload: contentId });
    }
  };

  const handleSaveContent = (contentData: Omit<ContentItem, 'id' | 'createdAt'>) => {
    if (selectedContent) {
      dispatch({
        type: 'UPDATE_CONTENT_ITEM',
        payload: {
          ...contentData,
          id: selectedContent.id,
          createdAt: selectedContent.createdAt,
        },
      });
    } else {
      dispatch({
        type: 'ADD_CONTENT_ITEM',
        payload: {
          ...contentData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      });
    }
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClient('');
    setSelectedTag('');
    setSelectedStatus('');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Vault</h1>
          <p className="text-gray-600">Store and manage your content library</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/planner"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Weekly Planner
          </Link>
          <button
            onClick={handleAddContent}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Content
          </button>
        </div>
      </div>

      {/* Planner Integration Info */}
      {readyContentCount > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-semibold text-primary-900">Ready for Scheduling</h3>
                <p className="text-sm text-primary-700">
                  {readyContentCount} content item{readyContentCount !== 1 ? 's' : ''} ready to be linked to posts in the Weekly Planner
                </p>
              </div>
            </div>
            <Link
              to="/planner"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Schedule Posts
            </Link>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Clients</option>
              {state.clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="idea">💡 Idea</option>
              <option value="ready">✅ Ready</option>
              <option value="pending">⏳ Pending</option>
              <option value="used">📝 Used</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Clear Filters
          </button>

          <div className="text-right">
            <p className="text-sm text-gray-600">
              Showing {filteredContent.length} of {state.contentItems.length} items
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{contentStats.total}</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">{contentStats.ideas}</p>
            <p className="text-sm text-gray-600">Ideas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{contentStats.ready}</p>
            <p className="text-sm text-gray-600">Ready</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{contentStats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{contentStats.used}</p>
            <p className="text-sm text-gray-600">Used</p>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      {filteredContent.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {state.contentItems.length === 0 ? 'No content yet' : 'No content found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {state.contentItems.length === 0 
              ? 'Start building your content library by adding your first item'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {state.contentItems.length === 0 && (
            <button
              onClick={handleAddContent}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Content
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContent.map(content => (
            <ContentCard
              key={content.id}
              content={content}
              client={state.clients.find(c => c.id === content.clientId)}
              onEdit={() => handleEditContent(content)}
              onDelete={() => handleDeleteContent(content.id)}
            />
          ))}
        </div>
      ) : (
        <ContentListView
          content={filteredContent}
          clients={state.clients}
          onEdit={handleEditContent}
          onDelete={handleDeleteContent}
        />
      )}

      {/* Content Modal */}
      {isModalOpen && (
        <ContentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContent(null);
          }}
          onSave={handleSaveContent}
          content={selectedContent}
          clients={state.clients}
          existingTags={allTags}
        />
      )}
    </div>
  );
}