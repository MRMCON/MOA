import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Link as LinkIcon, Plus, Eye, Archive } from 'lucide-react';
import { PlannerPost, Client, ContentItem } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { formatDateWithDay } from '../../utils/dateUtils';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<PlannerPost, 'id' | 'createdAt'>) => void;
  post?: PlannerPost | null;
  selectedDate: string;
  clients: Client[];
}

export function PostModal({ isOpen, onClose, onSave, post, selectedDate, clients }: PostModalProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    clientId: '',
    date: selectedDate,
    dayOfWeek: '',
    postType: 'info' as PlannerPost['postType'],
    title: '',
    notes: '',
    captionText: '',
    status: 'drafted' as PlannerPost['status'],
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showContentVault, setShowContentVault] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string>('');

  // Get available content for selected client
  const availableContent = state.contentItems.filter(item => 
    item.clientId === formData.clientId && 
    (item.status === 'ready' || item.status === 'pending')
  );

  useEffect(() => {
    if (post) {
      // Editing existing post
      setFormData({
        clientId: post.clientId,
        date: post.date,
        dayOfWeek: post.dayOfWeek,
        postType: post.postType,
        title: post.title,
        notes: post.notes || '',
        captionText: post.captionText || '',
        status: post.status,
      });
    } else {
      // Creating new post
      const date = new Date(selectedDate);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        dayOfWeek,
        clientId: clients.length === 1 ? clients[0].id : '',
        title: '',
        notes: '',
        captionText: '',
        postType: 'info',
        status: 'drafted',
      }));
    }
    setErrors({});
    setShowContentVault(false);
    setSelectedContentId('');
  }, [post, selectedDate, clients]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a post title';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Call the onSave function with the form data
    onSave(formData);
  };

  const handleDateChange = (newDate: string) => {
    const date = new Date(newDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    setFormData(prev => ({
      ...prev,
      date: newDate,
      dayOfWeek,
    }));
  };

  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({ ...prev, clientId }));
    setSelectedContentId(''); // Reset content selection when client changes
  };

  const handleLinkContent = (contentItem: ContentItem) => {
    setFormData(prev => ({
      ...prev,
      title: contentItem.title,
      captionText: contentItem.caption,
      notes: prev.notes + (prev.notes ? '\n\n' : '') + `Linked from Content Vault: ${contentItem.title}`,
    }));
    setSelectedContentId(contentItem.id);
    setShowContentVault(false);
  };

  const getContentStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-success-100 text-success-700';
      case 'pending':
        return 'bg-primary-100 text-primary-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getContentStatusIcon = (status: ContentItem['status']) => {
    switch (status) {
      case 'ready':
        return '✅';
      case 'pending':
        return '⏳';
      default:
        return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {post ? 'Edit Post' : 'Add New Post'}
              </h2>
              <p className="text-sm text-gray-600">
                {formatDateWithDay(formData.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Vault Integration */}
        {showContentVault ? (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Archive className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Link Content from Vault</h3>
              </div>
              <button
                onClick={() => setShowContentVault(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {availableContent.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No ready content found for this client</p>
                <p className="text-sm text-gray-500">Create content in the Content Vault first, or continue creating a new post</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {availableContent.map((content) => (
                  <div
                    key={content.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => handleLinkContent(content)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {content.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getContentStatusColor(content.status)}`}>
                        <span className="mr-1">{getContentStatusIcon(content.status)}</span>
                        {content.status === 'ready' ? 'Ready' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{content.caption}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {content.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {content.tags.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            +{content.tags.length - 2}
                          </span>
                        )}
                      </div>
                      <LinkIcon className="w-4 h-4 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Content Link Button */
          formData.clientId && availableContent.length > 0 && (
            <div className="p-4 border-b border-gray-200 bg-primary-50">
              <button
                type="button"
                onClick={() => setShowContentVault(true)}
                className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-dashed border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Archive className="w-5 h-5 mr-2" />
                Link Content from Vault ({availableContent.length} available)
              </button>
            </div>
          )
        )}

        {/* Selected Content Indicator */}
        {selectedContentId && (
          <div className="p-4 border-b border-gray-200 bg-success-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-success-900">Content Linked</p>
                  <p className="text-xs text-success-700">Post content has been populated from vault</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedContentId('');
                  setFormData(prev => ({
                    ...prev,
                    title: '',
                    captionText: '',
                    notes: prev.notes.replace(/\n\nLinked from Content Vault:.*$/, ''),
                  }));
                }}
                className="text-success-600 hover:text-success-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Client Selection */}
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  id="client"
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.clientId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Post Type */}
              <div>
                <label htmlFor="postType" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type *
                </label>
                <select
                  id="postType"
                  value={formData.postType}
                  onChange={(e) => setFormData(prev => ({ ...prev, postType: e.target.value as PlannerPost['postType'] }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="info">Info</option>
                  <option value="product">Product</option>
                  <option value="promo">Promo</option>
                  <option value="testimonial">Testimonial</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PlannerPost['status'] }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="drafted">Drafted</option>
                  <option value="awaiting-approval">Awaiting Approval</option>
                  <option value="approved">Approved</option>
                  <option value="posted">Posted</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title/Label *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Monday Motivation Post, Product Launch Announcement"
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Caption Text */}
              <div>
                <label htmlFor="captionText" className="block text-sm font-medium text-gray-700 mb-2">
                  Caption Text
                </label>
                <textarea
                  id="captionText"
                  value={formData.captionText}
                  onChange={(e) => setFormData(prev => ({ ...prev, captionText: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the caption text for this post..."
                />
                {selectedContentId && (
                  <p className="mt-1 text-xs text-success-600">
                    ✓ Content populated from vault
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Additional notes, instructions, or reminders..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              {post ? 'Update Post' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}