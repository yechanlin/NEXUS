import { useState, useEffect } from 'react';
import '../styles/mainPage.css';
import '../styles/navbar.css';
import SwipeCard from '../components/SwipeCard';
import { TbArrowBack } from 'react-icons/tb';
import { IoChevronDown } from 'react-icons/io5';
import { IoFilter } from 'react-icons/io5';
import { API_ENDPOINTS } from '../config/api';

const MainPage = () => {
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    projectType: '',
    skills: [],
    location: '',
    skillsRequired: '',
    maxMembers: '',
  });
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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
      // Add to swipe history
      setSwipeHistory((prev) => [
        ...prev,
        { projectIndex: currentIndex, direction },
      ]);
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

  // Handle save (upward swipe)
  const handleSave = async () => {
    const currentProject = projects[currentIndex];
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINTS.projects}/${currentProject._id}/save`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      if (data.status === 'success') {
        console.log('Project saved!');
      } else {
        console.error('Save failed:', data);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
    // Advance card (like a swipe)
    setSwipeHistory((prev) => [
      ...prev,
      { projectIndex: currentIndex, direction: 'up' },
    ]);
    if (currentIndex < projects.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      fetchProjects();
    }
  };

  // Handle going back to previous card
  const handleBack = () => {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setCurrentIndex(last.projectIndex);
    setSwipeHistory((prev) => prev.slice(0, -1));
  };

  return (
    <div className="main-page">
      <main className="main-content">
        {/* Filter UI */}
        <div className="mx-auto mb-6 w-full max-w-2xl">
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/80 shadow-2xl backdrop-blur-sm">
            {/* Filter Header - Always Visible */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <IoFilter className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  Filters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg bg-gray-700 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-600"
                  onClick={() =>
                    setFilters({
                      category: '',
                      projectType: '',
                      skills: [],
                      location: '',
                      skillsRequired: '',
                      maxMembers: '',
                    })
                  }
                >
                  Clear All
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-600"
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                >
                  <span>{isFilterExpanded ? 'Hide' : 'Show'} Filters</span>
                  <IoChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isFilterExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Collapsible Filter Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isFilterExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="border-t border-gray-700/50 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Category & Project Type Row */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            category: e.target.value,
                          }))
                        }
                        className="w-full appearance-none rounded-xl border border-gray-600 bg-gray-900 px-4 py-3 text-white transition-colors focus:border-blue-400 focus:outline-none"
                      >
                        <option value="">All Categories</option>
                        <option value="Software">Software</option>
                        <option value="Design">Design</option>
                        <option value="Research">Research</option>
                        <option value="Business">Business</option>
                        <option value="Competition">Competition</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <IoChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Project Type
                    </label>
                    <div className="relative">
                      <select
                        value={filters.projectType}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            projectType: e.target.value,
                          }))
                        }
                        className="w-full appearance-none rounded-xl border border-gray-600 bg-gray-900 px-4 py-3 text-white transition-colors focus:border-blue-400 focus:outline-none"
                      >
                        <option value="">All Types</option>
                        <option value="Academic">Academic</option>
                        <option value="Professional">Professional</option>
                        <option value="Hobby">Hobby</option>
                        <option value="Startup">Startup</option>
                        <option value="Hackathon">Hackathon</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <IoChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Location & Skills Row */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={filters.location}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, location: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Skills
                    </label>
                    <input
                      type="text"
                      placeholder="Enter skills..."
                      value={filters.skillsRequired}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          skillsRequired: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  {/* Max Members */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Max Team Size
                    </label>
                    <input
                      type="number"
                      placeholder="Enter max members..."
                      value={filters.maxMembers}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          maxMembers: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-blue-400 focus:outline-none"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Filter UI */}

        {/* Back Button */}
        <div className="mx-auto mb-4 flex w-full max-w-2xl justify-end">
          <button
            className="group flex items-center gap-2 rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white transition-all hover:border-blue-400 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleBack}
            disabled={swipeHistory.length === 0}
          >
            <TbArrowBack className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Go Back</span>
          </button>
        </div>
        {loading ? (
          <div className="loading-spinner">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="card-stack">
            {console.log('Current index:', currentIndex)}
            {console.log('Current project:', projects[currentIndex])}
            {(() => {
              console.log('Current filters:', filters);
              console.log('Total projects:', projects.length);
              console.log('Sample project data:', projects[0]);

              // TEMPORARILY DISABLE ALL FILTERS FOR TESTING
              const filteredProjects = projects; // Show all projects without filtering

              console.log(
                'Filtered projects count (showing all):',
                filteredProjects.length,
              );

              if (filteredProjects.length === 0) {
                return (
                  <div className="no-projects">
                    <h3>No projects available</h3>
                    <p>No projects found in the database</p>
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
                    onSave={handleSave}
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
