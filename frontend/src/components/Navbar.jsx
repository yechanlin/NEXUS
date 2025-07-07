import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUser,
  FiBookmark,
  FiPlusSquare,
  FiArchive,
  FiUsers,
  FiSearch,
  FiBell,
} from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import './../styles/navbar.css';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  // unreadCount will be handled in NotificationDropdown and passed up if needed

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
        <NavLink to="/my-projects" className="nav-link" activeClassName="active">
          <FiArchive /> <span>My Projects</span>
        </NavLink>
      </div>
      <div className="nav-actions">
        <NavLink to="/create-project" className="create-project-btn">
          <FiPlusSquare /> <span>Create Project</span>
        </NavLink>
        <div className="notification-bell-wrapper" style={{ position: 'relative', marginRight: '1rem' }}>
          <button
            className="notification-bell"
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label="Notifications"
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
          >
            <FiBell size={22} />
            {/* Unread badge will be handled in NotificationDropdown for now */}
          </button>
          {showDropdown && (
            <div className="notification-dropdown">
              <NotificationDropdown onClose={() => setShowDropdown(false)} />
            </div>
          )}
        </div>
        <div className="user-avatar">A</div>
      </div>
    </nav>
  );
};

export default Navbar; 
