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
        body: JSON.stringify({ status }),
      });
      if (response.status === 'success') {
        setApplications(prev =>
          prev.map(app => app._id === applicationId ? { ...app, status } : app)
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  // Muted, toned-down status styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':  return { color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' };
      case 'accepted': return { color: '#6ee7b7', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.2)' };
      case 'rejected': return { color: '#fca5a5', background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.2)' };
      default:         return { color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':  return <FiClock className="w-3 h-3" />;
      case 'accepted': return <FiCheck className="w-3 h-3" />;
      case 'rejected': return <FiX className="w-3 h-3" />;
      default:         return <FiClock className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '15px' }}>Loading your projects...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', color: '#f1f5f9' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px', textAlign: 'center', color: '#f1f5f9' }}>
          Recruiter Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Projects */}
          <div className="lg:col-span-1">
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f5f9' }}>
                <FiUsers size={16} /> My Projects
              </h2>

              {myProjects.length === 0 ? (
                <p style={{ color: 'var(--text-subtle)', fontSize: '14px' }}>No projects created yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myProjects.map((project) => {
                    const isSelected = selectedProject?._id === project._id;
                    return (
                      <div
                        key={project._id}
                        onClick={() => fetchApplications(project._id)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          background: isSelected ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
                          border: `1px solid ${isSelected ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`,
                        }}
                      >
                        <h3 style={{ fontWeight: 500, fontSize: '14px', color: '#f1f5f9', marginBottom: '2px' }}>{project.title}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '8px' }}>{project.category}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            {project.applications?.length || 0} applications
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            ...(project.status === 'open'
                              ? { color: '#6ee7b7', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.18)' }
                              : { color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' })
                          }}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Applications */}
          <div className="lg:col-span-2">
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              {selectedProject ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>
                      {selectedProject.title}
                    </h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                      {applications.length} application{applications.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-subtle)' }}>
                      <FiUsers size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                      <p style={{ fontSize: '14px' }}>No applications yet for this project.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {applications.map((application) => {
                        const statusStyle = getStatusStyle(application.status);
                        return (
                          <div key={application._id} style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            padding: '16px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: application.status === 'pending' ? '12px' : '0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '8px',
                                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                  <FiUser size={15} style={{ color: '#818cf8' }} />
                                </div>
                                <div>
                                  <h3 style={{ fontWeight: 500, fontSize: '14px', color: '#f1f5f9' }}>
                                    {application.user?.userName || 'Unknown User'}
                                  </h3>
                                  <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '1px' }}>
                                    Applied {formatDate(application.appliedAt)}
                                  </p>
                                </div>
                              </div>

                              {/* Status badge — muted */}
                              <span style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                fontSize: '12px', fontWeight: 500,
                                padding: '4px 10px', borderRadius: '999px',
                                ...statusStyle,
                              }}>
                                {getStatusIcon(application.status)}
                                <span style={{ textTransform: 'capitalize' }}>{application.status}</span>
                              </span>
                            </div>

                            {application.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => updateApplicationStatus(selectedProject._id, application._id, 'accepted')}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
                                    border: '1px solid rgba(110,231,183,0.25)',
                                    background: 'rgba(110,231,183,0.07)',
                                    color: '#6ee7b7', cursor: 'pointer', transition: 'background 0.15s',
                                  }}
                                >
                                  <FiCheck size={13} /> Accept
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(selectedProject._id, application._id, 'rejected')}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
                                    border: '1px solid rgba(252,165,165,0.2)',
                                    background: 'rgba(252,165,165,0.06)',
                                    color: '#fca5a5', cursor: 'pointer', transition: 'background 0.15s',
                                  }}
                                >
                                  <FiX size={13} /> Reject
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-subtle)' }}>
                  <FiEye size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px' }}>Select a project to view applications</p>
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
