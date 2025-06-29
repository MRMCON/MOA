import React from 'react';
import { Edit, Trash2, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { PlannerPost, Client } from '../../types';

interface PostCardProps {
  post: PlannerPost;
  client?: Client;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function PostCard({ post, client, onEdit, onDelete, compact = false }: PostCardProps) {
  const getStatusIcon = () => {
    switch (post.status) {
      case 'drafted':
        return <FileText className="w-3 h-3" />;
      case 'awaiting-approval':
        return <Clock className="w-3 h-3" />;
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'posted':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (post.status) {
      case 'drafted':
        return 'bg-gray-100 text-gray-700';
      case 'awaiting-approval':
        return 'bg-warning-100 text-warning-700';
      case 'approved':
        return 'bg-primary-100 text-primary-700';
      case 'posted':
        return 'bg-success-100 text-success-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPostTypeColor = () => {
    switch (post.postType) {
      case 'info':
        return 'bg-blue-100 text-blue-700';
      case 'product':
        return 'bg-purple-100 text-purple-700';
      case 'promo':
        return 'bg-orange-100 text-orange-700';
      case 'testimonial':
        return 'bg-green-100 text-green-700';
      case 'seasonal':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 hover:shadow-sm transition-shadow group">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full ${getPostTypeColor()}`}>
              {post.postType}
            </span>
            <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full ${getStatusColor()}`}>
              {getStatusIcon()}
            </span>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-0.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-0.5 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        <h4 className="font-medium text-gray-900 text-xs truncate">{post.title}</h4>
        {client && (
          <p className="text-xs text-gray-600 truncate">{client.name}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor()}`}>
              {post.postType}
            </span>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-1 capitalize">{post.status.replace('-', ' ')}</span>
            </span>
          </div>
          <h4 className="font-medium text-gray-900 text-sm truncate">{post.title}</h4>
          {client && (
            <p className="text-xs text-gray-600 truncate">{client.name}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content Preview */}
      {post.notes && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 line-clamp-2">{post.notes}</p>
        </div>
      )}
      
      {post.captionText && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 line-clamp-2 italic">"{post.captionText}"</p>
        </div>
      )}
    </div>
  );
}