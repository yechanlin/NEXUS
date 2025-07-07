import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { FiClock, FiCheck, FiX, FiMapPin, FiTag, FiCalendar } from 'react-icons/fi';
import '../styles/searcher.css';

const Searcher = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

  useEffect(() => {
    fetchMyApplications();
  }, [currentPage]);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${API_ENDPOINTS.userApplications}?page=${currentPage}&limit=10`);
      
      if (response.status === 'success') {
        setApplications(response.data.applications);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-900/20';
      case 'accepted': return 'text-green-500 bg-green-900/20';
      case 'rejected': return 'text-red-500 bg-red-900/20';
      default: return 'text-gray-500 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'accepted': return <FiCheck className="w-4 h-4" />;
      case 'rejected': return <FiX className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.application.status === filter;
  });

  const getStatusCount = (status) => {
    return applications.filter(app => app.application.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">My Applications</h1>
        
        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{applications.length}</div>
            <div className="text-sm text-gray-400">Total Applications</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{getStatusCount('pending')}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{getStatusCount('accepted')}</div>
            <div className="text-sm text-gray-400">Accepted</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{getStatusCount('rejected')}</div>
            <div className="text-sm text-gray-400">Rejected</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FiClock className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">
                {filter === 'all' 
                  ? "You haven't applied to any projects yet."
                  : `No ${filter} applications found.`
                }
              </p>
            </div>
          ) : (
            filteredApplications.map((item) => (
              <div key={item.application._id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.project.title}</h3>
                    <p className="text-gray-300 mb-3 line-clamp-2">{item.project.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-1" />
                        <span>{item.project.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center">
                        <FiTag className="w-4 h-4 mr-1" />
                        <span>{item.project.category}</span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span>Applied {formatDate(item.application.appliedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.application.status)}`}>
                      {getStatusIcon(item.application.status)}
                      <span className="ml-1 capitalize">{item.application.status}</span>
                    </span>
                  </div>
                </div>

                {/* Project Creator Info */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium">
                          {item.project.creator?.userName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Created by {item.project.creator?.userName || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{item.project.projectType} Project</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searcher;
