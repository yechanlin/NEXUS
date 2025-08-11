import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiPlusSquare,
  FiArchive,
  FiUsers,
  FiSearch,
  FiBell,
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { API_ENDPOINTS } from '../config/api';
import './../styles/navbar.css';

const Navbar = () => {
  const { user, profileData, fetchUserProfile } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileFetched = useRef(false); // Track if profile has been fetched

  // Fetch profile data when user is available and profile data is not loaded
  useEffect(() => {
    if (user?.id && user?.token && !profileData && !profileFetched.current) {
      profileFetched.current = true; // Mark as fetching to prevent multiple calls
      fetchUserProfile(user.id, user.token).catch(() => {
        profileFetched.current = false; // Reset on error to allow retry
      });
    }
  }, [user?.id, user?.token, profileData, fetchUserProfile]);

  // Reset the fetch flag when user changes
  useEffect(() => {
    profileFetched.current = false;
  }, [user?.id]);

  // Fetch initial notification count
  useEffect(() => {
    if (user?.token) {
      fetchInitialNotificationCount();
    }
  }, [user?.token]);

  const fetchInitialNotificationCount = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.notifications, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const unreadCount = data.data.notifications.filter(notif => !notif.read).length;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Function to get user initials
  const getUserInitial = () => {
    if (profileData?.userName) {
      return profileData.userName.charAt(0).toUpperCase();
    }
    if (user?.userName) {
      return user.userName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="navbar">
      <NavLink to="/mainPage" className="logo-text">
        NEXUS
      </NavLink>
      <div className="nav-links">
        <NavLink to="/mainPage" className="nav-link" activeClassName="active">
          <FiGrid /> <span>Discover</span>
        </NavLink>
        <NavLink to="/searcher" className="nav-link" activeClassName="active">
          <FiSearch /> <span>My Applications</span>
        </NavLink>
        <NavLink to="/recruiter" className="nav-link" activeClassName="active">
          <FiUsers /> <span>Manage Projects</span>
        </NavLink>
        <NavLink
          to="/my-projects"
          className="nav-link"
          activeClassName="active"
        >
          <FiArchive /> <span>My Projects</span>
        </NavLink>
      </div>
      <div className="nav-actions">
        <NavLink to="/create-project" className="create-project-btn">
          <FiPlusSquare /> <span>Create Project</span>
        </NavLink>
        <div
          className="notification-bell-wrapper"
          style={{ position: 'relative', marginRight: '1rem' }}
        >
          <button
            className="notification-bell"
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label="Notifications"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <FiBell size={22} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          {showDropdown && (
            <div className="notification-dropdown">
              <NotificationDropdown 
                onClose={() => setShowDropdown(false)} 
                onUnreadCountChange={setUnreadCount}
              />
            </div>
          )}
        </div>
        <NavLink to="/profile-edit" className="user-avatar">
          {profileData?.profileImage ? (
            <img
              src={profileData.profileImage}
              alt="Profile"
              className="avatar-image"
            />
          ) : (
            <span className="avatar-initial">{getUserInitial()}</span>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
