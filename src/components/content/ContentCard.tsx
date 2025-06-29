import React from 'react';
import { Edit, Trash2, Tag, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { ContentItem, Client } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface ContentCardProps {
  content: ContentItem;
  client?: Client;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContentCard({ content, client, onEdit, onDelete }: ContentCardProps) {
  const getStatusColor = () => {
    switch (content.status) {
      case 'idea':
        return 'bg-warning-100 text-warning-700';
      case 'ready':
        return 'bg-success-100 text-success-700';
      case 'pending':
        return 'bg-primary-100 text-primary-700';
      case 'used':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = () => {
    switch (content.status) {
      case 'idea':
        return '💡';
      case 'ready':
        return '✅';
      case 'pending':
        return '⏳';
      case 'used':
        return '📝';
      default:
        return '📄';
    }
  };

  const getStatusLabel = () => {
    switch (content.status) {
      case 'idea':
        return 'Idea';
      case 'ready':
        return 'Ready';
      case 'pending':
        return 'Pending';
      case 'used':
        return 'Used';
      default:
        return content.status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Image */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {content.image ? (
          <img
            src={content.image}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Actions Overlay */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 bg-white bg-opacity-90 text-gray-600 hover:text-primary-600 rounded-lg shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white bg-opacity-90 text-gray-600 hover:text-error-600 rounded-lg shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            <span className="mr-1">{getStatusIcon()}</span>
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{content.title}</h3>
        
        {/* Client */}
        {client && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <User className="w-4 h-4 mr-1" />
            <span className="truncate">{client.name}</span>
          </div>
        )}

        {/* Caption Preview */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{content.caption}</p>

        {/* Tags */}
        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                +{content.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{formatDate(content.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}