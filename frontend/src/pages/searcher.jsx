import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { FiClock, FiCheck, FiX, FiMapPin, FiTag, FiCalendar } from 'react-icons/fi';
import '../styles/searcher.css';

const Searcher = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':  return { color: '#fbbf24', background: 'rgba(251,191,36,0.08)',  border: '1px solid rgba(251,191,36,0.2)' };
      case 'accepted': return { color: '#6ee7b7', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.2)' };
      case 'rejected': return { color: '#fca5a5', background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.2)' };
      default:         return { color: '#94a3b8', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':  return <FiClock size={13} />;
      case 'accepted': return <FiCheck size={13} />;
      case 'rejected': return <FiX size={13} />;
      default:         return <FiClock size={13} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.application?.status === filter;
  });

  const getStatusCount = (status) => applications.filter(app => app.application?.status === status).length;

  const summaryCards = [
    { label: 'Total',    value: applications.length,        color: 'var(--accent-light)' },
    { label: 'Pending',  value: getStatusCount('pending'),   color: '#fbbf24' },
    { label: 'Accepted', value: getStatusCount('accepted'),  color: '#6ee7b7' },
    { label: 'Rejected', value: getStatusCount('rejected'),  color: '#fca5a5' },
  ];

  const filterTabs = ['all', 'pending', 'accepted', 'rejected'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-subtle)', fontSize: '15px' }}>Loading your applications...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '860px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px', textAlign: 'center', color: 'var(--text-primary)' }}>
          My Applications
        </h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {summaryCards.map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '6px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {filterTabs.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: filter === status ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
                color: filter === status ? 'var(--accent-light)' : 'var(--text-subtle)',
                border: filter === status ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Application cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-subtle)' }}>
              <FiClock size={36} style={{ marginBottom: '12px', opacity: 0.25 }} />
              <p style={{ fontSize: '14px' }}>
                {filter === 'all' ? "You haven't applied to any projects yet." : `No ${filter} applications.`}
              </p>
            </div>
          ) : (
            filteredApplications.map((item) => {
              const statusStyle = getStatusStyle(item.application?.status);
              return (
                <div key={item.application?._id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'border-color 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '14px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {item.project?.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '10px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.project?.description}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-subtle)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiMapPin size={12} /> {item.project?.location || 'Remote'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiTag size={12} /> {item.project?.category}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiCalendar size={12} /> Applied {formatDate(item.application?.appliedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status badge — muted */}
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                      fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '999px',
                      ...statusStyle,
                    }}>
                      {getStatusIcon(item.application?.status)}
                      <span style={{ textTransform: 'capitalize' }}>{item.application?.status}</span>
                    </span>
                  </div>

                  {/* Creator row */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 600, color: 'var(--accent-light)',
                    }}>
                      {item.project?.creator?.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                        {item.project?.creator?.userName || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                        {item.project?.projectType} Project
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                cursor: 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              Previous
            </button>
            <span style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
              background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                cursor: 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searcher;
