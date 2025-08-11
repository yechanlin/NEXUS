import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { FiCheckCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

const NotificationDropdown = ({ onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Optionally mark all as read here
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/api/users/notifications');
      if (response.status === 'success') {
        setNotifications(response.data.notifications);
        // Calculate and pass unread count to parent
        const unreadCount = response.data.notifications.filter(notif => !notif.read).length;
        if (onUnreadCountChange) {
          onUnreadCountChange(unreadCount);
        }
      }
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'application_status':
        return <FiCheckCircle className="text-green-400 mr-2" />;
      case 'new_application':
        return <FiInfo className="text-blue-400 mr-2" />;
      case 'application_submitted':
        return <FiCheckCircle className="text-blue-400 mr-2" />;
      case 'project_skipped':
        return <FiX className="text-gray-400 mr-2" />;
      default:
        return <FiInfo className="text-gray-400 mr-2" />;
    }
  };

  return (
    <div className="notification-dropdown-content">
      <div className="dropdown-header">
        <span>Notifications</span>
        <button className="close-btn" onClick={onClose}><FiXCircle /></button>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="empty">No notifications yet.</div>
      ) : (
        <ul className="notification-list">
          {notifications.slice(0, 10).map((notif, idx) => (
            <li
              key={idx}
              className={`notification-item ${notif.read ? '' : 'unread'}`}
            >
              {getIcon(notif.type)}
              <div className="notification-message">
                <span>{notif.message}</span>
                <div className="notification-meta">
                  {notif.relatedProject?.title && (
                    <span className="project-title">{notif.relatedProject.title}</span>
                  )}
                  <span className="timestamp">{new Date(notif.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationDropdown; 