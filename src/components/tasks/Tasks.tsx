import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Search, Filter, CheckSquare, Calendar, User, Clock, Edit, Trash2, Check, X, AlertCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Task } from '../../types';
import { TaskModal } from './TaskModal';
import { formatDate, isOverdue } from '../../utils/dateUtils';

export function Tasks() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClient = !selectedClient || task.clientId === selectedClient;
      const matchesStatus = !selectedStatus || task.status === selectedStatus;
      
      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [state.tasks, searchTerm, selectedClient, selectedStatus]);

  // Task statistics
  const taskStats = useMemo(() => {
    const total = filteredTasks.length;
    const byStatus = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const overdue = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      return isOverdue(task.dueDate) && task.status !== 'completed';
    }).length;
    
    return {
      total,
      pending: byStatus.pending || 0,
      inProgress: byStatus['in-progress'] || 0,
      completed: byStatus.completed || 0,
      overdue,
    };
  }, [filteredTasks]);

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (selectedTask) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...taskData,
          id: selectedTask.id,
          createdAt: selectedTask.createdAt,
        },
      });
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      });
    }
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleQuickStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...task,
          status: newStatus,
        },
      });
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'in-progress':
        return 'bg-warning-100 text-warning-700';
      case 'completed':
        return 'bg-success-100 text-success-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'in-progress':
        return <Target className="w-3 h-3" />;
      case 'completed':
        return <Check className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return isOverdue(task.dueDate);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClient('');
    setSelectedStatus('');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage client tasks and workflows</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/tools"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Target className="w-4 h-4 mr-2" />
            Task Generator
          </Link>
          <button
            onClick={handleAddTask}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-warning-500 to-warning-600 text-white rounded-lg hover:from-warning-600 hover:to-warning-700 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Clients</option>
              {state.clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
              Showing {filteredTasks.length} of {state.tasks.length} tasks
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            <p className="text-sm text-gray-600">Total Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{taskStats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">{taskStats.inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{taskStats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-error-600">{taskStats.overdue}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {state.tasks.length === 0 ? 'No tasks yet' : 'No tasks found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {state.tasks.length === 0 
              ? 'Create your first task or use the Task Generator to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {state.tasks.length === 0 && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleAddTask}
                className="inline-flex items-center px-6 py-3 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Task
              </button>
              <Link
                to="/tools"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Target className="w-5 h-5 mr-2" />
                Use Task Generator
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const client = state.clients.find(c => c.id === task.clientId);
            const taskIsOverdue = isTaskOverdue(task);
            
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  taskIsOverdue ? 'border-error-200 bg-error-50' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
                        </span>
                        
                        {taskIsOverdue && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-error-100 text-error-700 rounded-full">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </span>
                        )}
                        
                        {client && (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">{client.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.description}</h3>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        
                        {task.assignedTo && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Assigned to: {task.assignedTo}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created: {formatDate(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Task Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Quick Status Updates */}
                      {task.status !== 'completed' && (
                        <div className="flex items-center space-x-1">
                          {task.status === 'pending' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(task.id, 'in-progress')}
                              className="p-2 text-gray-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                              title="Start Task"
                            >
                              <Target className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleQuickStatusUpdate(task.id, 'completed')}
                            className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                            title="Mark Complete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {task.status === 'completed' && (
                        <button
                          onClick={() => handleQuickStatusUpdate(task.id, 'pending')}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Mark Incomplete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit Task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          task={selectedTask}
          clients={state.clients}
        />
      )}
    </div>
  );
}