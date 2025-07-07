import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { FiUsers, FiCheck, FiX, FiEye, FiClock, FiUser } from 'react-icons/fi';
import '../styles/recruiter.css';

const Recruiter = () => {
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${API_ENDPOINTS.userProjects}?page=${currentPage}&limit=10`);
      
      if (response.status === 'success') {
        setMyProjects(response.data.projects);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (projectId) => {
    try {
      const response = await apiCall(API_ENDPOINTS.projectApplications(projectId));
      
      if (response.status === 'success') {
        setApplications(response.data.project.applications);
        setSelectedProject(response.data.project);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const updateApplicationStatus = async (projectId, applicationId, status) => {
    try {
      const response = await apiCall(API_ENDPOINTS.updateApplicationStatus(projectId, applicationId), {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      if (response.status === 'success') {
        // Update the application in the local state
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { ...app, status } 
              : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'accepted': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Recruiter Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Projects Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiUsers className="mr-2" />
                My Projects
              </h2>
              
              {myProjects.length === 0 ? (
                <p className="text-gray-400">No projects created yet.</p>
              ) : (
                <div className="space-y-3">
                  {myProjects.map((project) => (
                    <div
                      key={project._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedProject?._id === project._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => fetchApplications(project._id)}
                    >
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-300">{project.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {project.applications?.length || 0} applications
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          project.status === 'open' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Applications Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              {selectedProject ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      Applications for: {selectedProject.title}
                    </h2>
                    <span className="text-sm text-gray-400">
                      {applications.length} total applications
                    </span>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <FiUsers className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No applications yet for this project.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application._id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                <FiUser className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {application.user?.userName || 'Unknown User'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  Applied {formatDate(application.appliedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`flex items-center mr-3 ${getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1 capitalize">{application.status}</span>
                              </span>
                            </div>
                          </div>

                          {application.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateApplicationStatus(selectedProject._id, application._id, 'accepted')}
                                className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                              >
                                <FiCheck className="w-4 h-4 mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(selectedProject._id, application._id, 'rejected')}
                                className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                              >
                                <FiX className="w-4 h-4 mr-1" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <FiEye className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Select a project to view applications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recruiter;
