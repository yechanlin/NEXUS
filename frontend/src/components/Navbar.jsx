import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUser,
  FiBookmark,
  FiPlusSquare,
  FiArchive,
} from 'react-icons/fi';
import './../styles/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/mainPage" className="logo-text">
        NEXUS
      </NavLink>
      <div className="nav-links">
        <NavLink to="/mainPage" className="nav-link" activeClassName="active">
          <FiGrid /> <span>Projects</span>
        </NavLink>
        <NavLink to="/members" className="nav-link" activeClassName="active">
          <FiUser /> <span>Members</span>
        </NavLink>
        <NavLink to="/saved" className="nav-link" activeClassName="active">
          <FiBookmark /> <span>Saved</span>
        </NavLink>
      </div>
      <div className="nav-actions">
        <NavLink to="/create-project" className="create-project-btn">
          <FiPlusSquare /> <span>Create Project</span>
        </NavLink>
        <NavLink to="/my-projects" className="nav-link" activeClassName="active">
          <FiArchive /> <span>My Projects</span>
        </NavLink>
        <div className="user-avatar">A</div>
      </div>
    </nav>
  );
};

export default Navbar; 