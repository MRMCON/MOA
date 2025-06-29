import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Filter, Calendar, ChevronLeft, ChevronRight, Archive, ExternalLink, Grid, List } from 'lucide-react';
import { PlannerPost } from '../../types';
import { PostModal } from './PostModal';
import { PostCard } from './PostCard';
import { Link } from 'react-router-dom';
import { formatDateRange, formatMonthYear } from '../../utils/dateUtils';

export function WeeklyPlanner() {
  const { state, dispatch } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PlannerPost | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Get start of week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Get start of month
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Get calendar days based on view mode
  const calendarDays = useMemo(() => {
    if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        return day;
      });
    } else {
      // Monthly view
      const monthStart = getMonthStart(currentDate);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Get the first Monday of the calendar (might be from previous month)
      const calendarStart = getWeekStart(monthStart);
      
      // Calculate how many days to show (always show complete weeks)
      const weeksToShow = Math.ceil((monthEnd.getDate() + (monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1)) / 7);
      const totalDays = weeksToShow * 7;
      
      return Array.from({ length: totalDays }, (_, i) => {
        const day = new Date(calendarStart);
        day.setDate(calendarStart.getDate() + i);
        return day;
      });
    }
  }, [currentDate, viewMode]);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filter posts by selected client and current period
  const filteredPosts = useMemo(() => {
    const startDate = calendarDays[0];
    const endDate = calendarDays[calendarDays.length - 1];
    
    return state.plannerPosts.filter(post => {
      const postDate = new Date(post.date);
      const isInPeriod = postDate >= startDate && postDate <= endDate;
      const matchesClient = !selectedClient || post.clientId === selectedClient;
      return isInPeriod && matchesClient;
    });
  }, [state.plannerPosts, calendarDays, selectedClient]);

  // Group posts by day
  const postsByDay = useMemo(() => {
    const grouped: { [key: string]: PlannerPost[] } = {};
    calendarDays.forEach(day => {
      const dayKey = day.toISOString().split('T')[0];
      grouped[dayKey] = filteredPosts.filter(post => post.date === dayKey);
    });
    return grouped;
  }, [filteredPosts, calendarDays]);

  // Calculate period summary
  const periodSummary = useMemo(() => {
    const total = filteredPosts.length;
    const byStatus = filteredPosts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      drafted: byStatus.drafted || 0,
      awaitingApproval: byStatus['awaiting-approval'] || 0,
      approved: byStatus.approved || 0,
      posted: byStatus.posted || 0,
    };
  }, [filteredPosts]);

  // Get available content count for selected client
  const availableContentCount = useMemo(() => {
    if (!selectedClient) return 0;
    return state.contentItems.filter(item => 
      item.clientId === selectedClient && 
      (item.status === 'ready' || item.status === 'pending')
    ).length;
  }, [state.contentItems, selectedClient]);

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleAddPost = (day: Date) => {
    setSelectedDay(day.toISOString().split('T')[0]);
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  const handleEditPost = (post: PlannerPost) => {
    setSelectedPost(post);
    setSelectedDay(post.date);
    setIsModalOpen(true);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch({ type: 'DELETE_PLANNER_POST', payload: postId });
    }
  };

  const handleSavePost = (postData: Omit<PlannerPost, 'id' | 'createdAt'>) => {
    if (selectedPost) {
      // Update existing post
      dispatch({
        type: 'UPDATE_PLANNER_POST',
        payload: {
          ...postData,
          id: selectedPost.id,
          createdAt: selectedPost.createdAt,
        },
      });
    } else {
      // Create new post
      const newPost: PlannerPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({
        type: 'ADD_PLANNER_POST',
        payload: newPost,
      });
    }
    
    // Close modal and reset state
    setIsModalOpen(false);
    setSelectedPost(null);
    setSelectedDay('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setSelectedDay('');
  };

  const formatPeriodRange = () => {
    if (viewMode === 'week') {
      const weekStart = calendarDays[0];
      const weekEnd = calendarDays[6];
      return formatDateRange(weekStart, weekEnd);
    } else {
      return formatMonthYear(currentDate);
    }
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  const isToday = (day: Date) => {
    return day.toDateString() === new Date().toDateString();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {viewMode === 'week' ? 'Weekly' : 'Monthly'} Planner
          </h1>
          <p className="text-gray-600">Schedule and manage your content posts</p>
        </div>
        <Link
          to="/content"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Archive className="w-4 h-4 mr-2" />
          Content Vault
        </Link>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Period Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousPeriod}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">{formatPeriodRange()}</h2>
              <p className="text-sm text-gray-600">{viewMode === 'week' ? 'Week' : 'Month'} View</p>
            </div>
            <button
              onClick={handleNextPeriod}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4 mr-2 inline" />
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4 mr-2 inline" />
                Month
              </button>
            </div>

            {/* Client Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Clients</option>
                {state.clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Vault Integration Info */}
        {selectedClient && availableContentCount > 0 && (
          <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Archive className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-primary-900">
                    {availableContentCount} content item{availableContentCount !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-xs text-primary-700">
                    Link existing content when creating posts
                  </p>
                </div>
              </div>
              <Link
                to="/content"
                className="inline-flex items-center px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Vault
              </Link>
            </div>
          </div>
        )}

        {/* Period Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{periodSummary.total}</p>
              <p className="text-sm text-gray-600">Total Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">{periodSummary.drafted}</p>
              <p className="text-sm text-gray-600">Drafted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">{periodSummary.awaitingApproval}</p>
              <p className="text-sm text-gray-600">Awaiting Approval</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{periodSummary.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">{periodSummary.posted}</p>
              <p className="text-sm text-gray-600">Posted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-4 ${
        viewMode === 'week' 
          ? 'grid-cols-1 lg:grid-cols-7' 
          : 'grid-cols-7'
      }`}>
        {/* Day Headers for Monthly View */}
        {viewMode === 'month' && (
          <>
            {dayNames.map((dayName) => (
              <div key={dayName} className="p-4 text-center font-semibold text-gray-700 bg-gray-50 rounded-lg">
                <span className="hidden md:inline">{dayName}</span>
                <span className="md:hidden">{dayName.slice(0, 3)}</span>
              </div>
            ))}
          </>
        )}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const dayKey = day.toISOString().split('T')[0];
          const dayPosts = postsByDay[dayKey] || [];
          const isDayToday = isToday(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          
          return (
            <div
              key={dayKey}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md ${
                isDayToday ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
              } ${
                viewMode === 'month' 
                  ? `min-h-[120px] ${!isCurrentMonthDay ? 'opacity-50 bg-gray-50' : ''}` 
                  : 'min-h-[400px]'
              }`}
            >
              {/* Day Header */}
              <div className={`p-4 border-b border-gray-200 ${
                isDayToday ? 'bg-primary-50' : isCurrentMonthDay || viewMode === 'week' ? '' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    {viewMode === 'week' && (
                      <h3 className={`font-semibold ${isDayToday ? 'text-primary-700' : 'text-gray-900'}`}>
                        {dayNames[index]}
                      </h3>
                    )}
                    <p className={`text-sm ${
                      isDayToday ? 'text-primary-600' : 
                      isCurrentMonthDay || viewMode === 'week' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {viewMode === 'month' 
                        ? day.getDate().toString().padStart(2, '0')
                        : `${day.getDate().toString().padStart(2, '0')}/${(day.getMonth() + 1).toString().padStart(2, '0')}`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddPost(day)}
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Add new post"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {dayPosts.length > 0 && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDayToday ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Posts */}
              <div className={`p-4 space-y-3 ${viewMode === 'month' ? 'max-h-20 overflow-hidden' : ''}`}>
                {dayPosts.length === 0 ? (
                  <div className={`text-center ${viewMode === 'month' ? 'py-2' : 'py-8'}`}>
                    <Calendar className={`text-gray-300 mx-auto mb-2 ${viewMode === 'month' ? 'w-4 h-4' : 'w-8 h-8'}`} />
                    {viewMode === 'week' && (
                      <>
                        <p className="text-sm text-gray-500">No posts scheduled</p>
                        <button
                          onClick={() => handleAddPost(day)}
                          className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Add a post
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {dayPosts.slice(0, viewMode === 'month' ? 1 : dayPosts.length).map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        client={state.clients.find(c => c.id === post.clientId)}
                        onEdit={() => handleEditPost(post)}
                        onDelete={() => handleDeletePost(post.id)}
                        compact={viewMode === 'month'}
                      />
                    ))}
                    {viewMode === 'month' && dayPosts.length > 1 && (
                      <div className="text-center">
                        <span className="text-xs text-gray-500">
                          +{dayPosts.length - 1} more
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <PostModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePost}
          post={selectedPost}
          selectedDate={selectedDay}
          clients={state.clients}
        />
      )}
    </div>
  );
}