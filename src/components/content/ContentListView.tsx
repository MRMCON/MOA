import React from 'react';
import { Edit, Trash2, Tag, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { ContentItem, Client } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface ContentListViewProps {
  content: ContentItem[];
  clients: Client[];
  onEdit: (content: ContentItem) => void;
  onDelete: (contentId: string) => void;
}

export function ContentListView({ content, clients, onEdit, onDelete }: ContentListViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'idea':
        return 'Idea';
      case 'ready':
        return 'Ready';
      case 'pending':
        return 'Pending';
      case 'used':
        return 'Used';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Content</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Client</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Tags</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Created</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {content.map((item) => {
              const client = clients.find(c => c.id === item.clientId);
              
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.caption}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {client ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-gray-900 truncate">{client.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No client</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      <span className="mr-1">{getStatusIcon(item.status)}</span>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
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
  );
}