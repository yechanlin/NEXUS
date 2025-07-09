import React, { useState, useEffect } from 'react';
import '../styles/mainPage.css';
import '../styles/navbar.css';
import SwipeCard from '../components/SwipeCard';
import { FiUser, FiUsers, FiBookmark, FiGrid } from 'react-icons/fi';
import { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    projectType: '',
    skills: [],
    maxDistance: 50,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.projects}/fetch`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      console.log('Projects data:', data);

      if (data.status === 'success' && Array.isArray(data.data?.projects)) {
        setProjects(data.data.projects);
        setCurrentIndex(0);
      } else {
        console.error('Invalid project data format:', data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    const currentProject = projects[currentIndex];
    try {
      const token = localStorage.getItem('token');
      if (direction === 'right') {
        await fetch(`${API_ENDPOINTS.projects}/${currentProject._id}/apply`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else if (direction === 'left') {
        await fetch(API_ENDPOINTS.skipProject(currentProject._id), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      // Move to next project
      if (currentIndex < projects.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Fetch more projects when we run out
        fetchProjects();
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
    }
  };

  return (
    <div className="main-page">
      <main className="main-content">
        {/* Filter UI */}
        <div className="filter-container">
          <label className="filter-label">
            Category:
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All</option>
              <option value="Software">Software</option>
              <option value="Design">Design</option>
              <option value="Research">Research</option>
              <option value="Business">Business</option>
              <option value="Competition">Competition</option>
            </select>
          </label>
          <label className="filter-label">
            Project Type:
            <select
              value={filters.projectType}
              onChange={(e) =>
                setFilters((f) => ({ ...f, projectType: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All</option>
              <option value="Academic">Academic</option>
              <option value="Professional">Professional</option>
              <option value="Hobby">Hobby</option>
              <option value="Startup">Startup</option>
              <option value="Hackathon">Hackathon</option>
            </select>
          </label>
        </div>
        {/* End Filter UI */}
        {loading ? (
          <div className="loading-spinner">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="card-stack">
            {console.log('Current index:', currentIndex)}
            {console.log('Current project:', projects[currentIndex])}
            {/* Filter projects before rendering */}
            {(() => {
              const filteredProjects = projects.filter((project) => {
                // Category filter
                if (filters.category && project.category !== filters.category)
                  return false;
                // Project type filter
                if (
                  filters.projectType &&
                  project.projectType !== filters.projectType
                )
                  return false;
                return true;
              });
              if (filteredProjects.length === 0) {
                return (
                  <div className="no-projects">
                    <h3>No projects match your filters</h3>
                  </div>
                );
              }
              // Adjust currentIndex if out of bounds
              const safeIndex = Math.min(
                currentIndex,
                filteredProjects.length - 1,
              );
              return (
                safeIndex >= 0 && (
                  <SwipeCard
                    key={filteredProjects[safeIndex]._id}
                    project={filteredProjects[safeIndex]}
                    onSwipe={handleSwipe}
                  />
                )
              );
            })()}
          </div>
        ) : (
          <div className="no-projects">
            <h3>No projects available</h3>
            <p>Current projects array length: {projects.length}</p>
            <button className="refresh-button" onClick={fetchProjects}>
              Refresh
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainPage;
