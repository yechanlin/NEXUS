import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiPlusSquare,
  FiArchive,
  FiUsers,
  FiSearch,
  FiBell,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { API_ENDPOINTS } from '../config/api';
import './../styles/navbar.css';

const Navbar = () => {
  const { user, profileData, fetchUserProfile, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const profileFetched = useRef(false); // Track if profile has been fetched
  const userDropdownRef = useRef(null);

  // Fetch profile data when user is available and profile data is not loaded
  useEffect(() => {
    if (user?.id && user?.token && !profileData && !profileFetched.current) {
      profileFetched.current = true; // Mark as fetching to prevent multiple calls
      fetchUserProfile(user.id, user.token).catch(() => {
        profileFetched.current = false; // Reset on error to allow retry
      });
    }
  }, [user?.id, user?.token, profileData, fetchUserProfile]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      } else {
        // Silently handle auth errors - user might not be logged in properly
        if (response.status === 401 || response.status === 403) {
          console.log('User not authenticated for notifications');
        }
      }
    } catch (error) {
      // Silently handle network errors
      console.log('Notifications service unavailable');
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

  // Handle sign out
  const handleSignOut = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <NavLink to="/mainPage" className="logo-text" onClick={closeMenu}>
        NEXUS
      </NavLink>

      {/* Desktop nav links — hidden on mobile, shown as drawer when menuOpen */}
      <div className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
        <NavLink to="/mainPage" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
          <FiGrid /> <span>Discover</span>
        </NavLink>
        <NavLink to="/searcher" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
          <FiSearch /> <span>My Applications</span>
        </NavLink>
        <NavLink to="/recruiter" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
          <FiUsers /> <span>Manage Projects</span>
        </NavLink>
        <NavLink to="/my-projects" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
          <FiArchive /> <span>My Projects</span>
        </NavLink>
      </div>
      <div className="nav-actions">
        {/* Hamburger — only visible on mobile via CSS */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
        <NavLink to="/create-project" className="create-project-btn">
          <FiPlusSquare /> <span>Create Project</span>
        </NavLink>
        <div className="notification-bell-wrapper">
          <button
            className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label="Notifications"
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
        <div className="user-dropdown-wrapper" ref={userDropdownRef}>
          <button
            className="user-avatar"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            aria-label="User menu"
          >
            {profileData?.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="avatar-image"
              />
            ) : (
              <span className="avatar-initial">{getUserInitial()}</span>
            )}
          </button>
          {showUserDropdown && (
            <div className="user-dropdown">
              <NavLink 
                to="/profile-edit" 
                className="user-dropdown-item"
                onClick={() => setShowUserDropdown(false)}
              >
                <FiUser />
                <span>Profile</span>
              </NavLink>
              <button 
                className="user-dropdown-item"
                onClick={handleSignOut}
              >
                <FiLogOut />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
