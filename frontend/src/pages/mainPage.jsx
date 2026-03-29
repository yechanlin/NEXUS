import { useState, useEffect, useRef } from 'react';
import '../styles/mainPage.css';
import SwipeCard from '../components/SwipeCard';
import { TbArrowBack } from 'react-icons/tb';
import { IoChevronDown, IoFilter } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import { API_ENDPOINTS } from '../config/api';
import { ALL_AVAILABLE_SKILLS } from '../constants/skills';
import { US_LOCATIONS } from '../data/autocompleteData';

const MainPage = () => {
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '', projectType: '', skills: [],
    location: '', skillsRequired: '', maxMembers: '',
  });
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const locationInputRef = useRef(null);
  const locationContainerRef = useRef(null);
  const skillsInputRef = useRef(null);
  const skillsSuggestionsContainerRef = useRef(null);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { setCurrentIndex(0); }, [filters]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        skillsInputRef.current && !skillsInputRef.current.contains(e.target) &&
        !skillsSuggestionsContainerRef.current?.contains(e.target)
      ) setShowSkillSuggestions(false);
      if (locationContainerRef.current && !locationContainerRef.current.contains(e.target))
        setShowLocationSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateLocationSuggestions = (query) => {
    if (!query || query.length < 2) { setLocationSuggestions([]); setShowLocationSuggestions(false); return; }
    const q = query.toLowerCase();
    const results = US_LOCATIONS.filter(l => l.toLowerCase().includes(q)).slice(0, 8);
    setLocationSuggestions(results);
    setShowLocationSuggestions(results.length > 0);
  };

  const generateSkillSuggestions = (inputString) => {
    const parts = inputString.split(',').map((s) => s.trim());
    const lastPart = (parts[parts.length - 1] || '').toLowerCase();
    if (lastPart.length < 2) { setSkillSuggestions([]); setShowSkillSuggestions(false); return; }
    const currentSkills = parts.slice(0, -1).map((s) => s.toLowerCase());
    const filtered = ALL_AVAILABLE_SKILLS.filter((skill) => {
      const lc = skill.toLowerCase();
      return lc.includes(lastPart) && !currentSkills.includes(lc);
    }).slice(0, 7);
    setSkillSuggestions(filtered);
    setShowSkillSuggestions(filtered.length > 0);
  };

  const handleSkillSuggestionClick = (suggestedSkill) => {
    const parts = (filters.skillsRequired || '').split(',').map((s) => s.trim());
    parts[Math.max(parts.length - 1, 0)] = suggestedSkill;
    let newSkillsString = parts.filter(Boolean).join(', ');
    if (!newSkillsString.endsWith(', ')) newSkillsString += ', ';
    setFilters((prev) => ({ ...prev, skillsRequired: newSkillsString }));
    setSkillSuggestions([]);
    setShowSkillSuggestions(false);
    skillsInputRef.current?.focus();
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      const response = await fetch(`${API_ENDPOINTS.projects}/fetch`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; return; }
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data?.projects)) {
        setProjects(data.data.projects);
        setCurrentIndex(0);
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
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      } else if (direction === 'left') {
        await fetch(API_ENDPOINTS.skipProject(currentProject._id), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      }
      setSwipeHistory((prev) => [...prev, { projectIndex: currentIndex, direction }]);
      if (currentIndex < projects.length - 1) setCurrentIndex((prev) => prev + 1);
      else fetchProjects();
    } catch (error) {
      console.error('Error handling swipe:', error);
    }
  };

  const handleSave = async () => {
    const currentProject = projects[currentIndex];
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.projects}/${currentProject._id}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error saving project:', error);
    }
    setSwipeHistory((prev) => [...prev, { projectIndex: currentIndex, direction: 'up' }]);
    if (currentIndex < projects.length - 1) setCurrentIndex((prev) => prev + 1);
    else fetchProjects();
  };

  const handleBack = () => {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setCurrentIndex(last.projectIndex);
    setSwipeHistory((prev) => prev.slice(0, -1));
  };

  const clearFilters = () => setFilters({ category: '', projectType: '', skills: [], location: '', skillsRequired: '', maxMembers: '' });

  const filteredProjects = projects.filter((project) => {
    if (filters.category && project.category !== filters.category) return false;
    if (filters.projectType && project.projectType !== filters.projectType) return false;
    if (filters.location && !project.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.skills?.length > 0) {
      const projectSkills = project.skillsRequired || [];
      if (!filters.skills.some(fs => projectSkills.some(ps => ps.toLowerCase().includes(fs.toLowerCase())))) return false;
    }
    if (filters.skillsRequired && !project.skillsRequired?.some(s => s.toLowerCase().includes(filters.skillsRequired.toLowerCase()))) return false;
    if (filters.maxMembers && project.maxMembers > parseInt(filters.maxMembers)) return false;
    return true;
  });

  const hasActiveFilters = Object.values(filters).some(v =>
    v !== '' && v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  const safeIndex = Math.min(currentIndex, filteredProjects.length - 1);

  return (
    <div className="main-page">
      <main className="main-content">

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-header">
            <div className="filter-header-left">
              <IoFilter size={16} style={{ color: 'var(--accent-light)' }} />
              <span className="filter-title">Filters</span>
              {hasActiveFilters && <span className="filter-active-dot" />}
            </div>
            <div className="filter-header-right">
              {hasActiveFilters && (
                <button className="filter-clear-btn" onClick={clearFilters}>Clear All</button>
              )}
              <button
                className="filter-toggle-btn"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                <span>{isFilterExpanded ? 'Hide' : 'Show'} Filters</span>
                <IoChevronDown
                  size={15}
                  style={{
                    transition: 'transform 0.25s',
                    transform: isFilterExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
            </div>
          </div>

          <div className={`filter-body ${isFilterExpanded ? 'filter-body-open' : ''}`}>
            <div className="filter-grid">
              <div className="filter-field">
                <label className="filter-label">Category</label>
                <div className="filter-select-wrap">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="">All Categories</option>
                    <option value="Software">Software</option>
                    <option value="Design">Design</option>
                    <option value="Research">Research</option>
                    <option value="Business">Business</option>
                    <option value="Competition">Competition</option>
                  </select>
                  <IoChevronDown size={13} className="filter-select-icon" />
                </div>
              </div>

              <div className="filter-field">
                <label className="filter-label">Project Type</label>
                <div className="filter-select-wrap">
                  <select
                    value={filters.projectType}
                    onChange={(e) => setFilters((f) => ({ ...f, projectType: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="">All Types</option>
                    <option value="Academic">Academic</option>
                    <option value="Professional">Professional</option>
                    <option value="Hobby">Hobby</option>
                    <option value="Startup">Startup</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>
                  <IoChevronDown size={13} className="filter-select-icon" />
                </div>
              </div>

              <div className="filter-field" ref={locationContainerRef} style={{ position: 'relative' }}>
                <label className="filter-label">Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, Remote..."
                  ref={locationInputRef}
                  value={filters.location}
                  autoComplete="off"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, location: e.target.value }));
                    generateLocationSuggestions(e.target.value);
                  }}
                  onFocus={() => generateLocationSuggestions(filters.location)}
                  className="filter-input"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="filter-suggestions-dropdown">
                    {locationSuggestions.map((loc) => (
                      <div
                        key={loc}
                        className="filter-suggestion-item"
                        onMouseDown={() => {
                          setFilters((f) => ({ ...f, location: loc }));
                          setShowLocationSuggestions(false);
                        }}
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="filter-field" style={{ position: 'relative' }}>
                <label className="filter-label">Skills</label>
                <input
                  ref={skillsInputRef}
                  type="text"
                  placeholder="e.g. React, Python..."
                  value={filters.skillsRequired}
                  autoComplete="off"
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, skillsRequired: e.target.value }));
                    generateSkillSuggestions(e.target.value);
                  }}
                  onFocus={() => generateSkillSuggestions(filters.skillsRequired)}
                  className="filter-input"
                />
                {showSkillSuggestions && skillSuggestions.length > 0 && (
                  <div ref={skillsSuggestionsContainerRef} className="filter-suggestions-dropdown">
                    {skillSuggestions.map((skill) => (
                      <div
                        key={skill}
                        className="filter-suggestion-item"
                        onMouseDown={() => handleSkillSuggestionClick(skill)}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="filter-field filter-field-full">
                <label className="filter-label">Max Team Size</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={filters.maxMembers}
                  onChange={(e) => setFilters((f) => ({ ...f, maxMembers: e.target.value }))}
                  className="filter-input"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Go Back button */}
        <div className="back-btn-row">
          <button
            className="back-btn"
            onClick={handleBack}
            disabled={swipeHistory.length === 0}
          >
            <TbArrowBack size={16} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="main-loading">
            <div className="main-loading-spinner" />
            <p>Finding projects for you…</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="no-projects-state">
            <div className="no-projects-icon">
              <FiSearch size={32} />
            </div>
            <h3>No projects found</h3>
            <p>
              {hasActiveFilters
                ? 'Try adjusting your filters to discover more projects.'
                : 'No new projects are available right now.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {hasActiveFilters && (
                <button className="state-btn state-btn-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
              <button className="state-btn state-btn-primary" onClick={fetchProjects}>
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="card-stack">
            {safeIndex >= 0 && (
              <SwipeCard
                key={filteredProjects[safeIndex]._id}
                project={filteredProjects[safeIndex]}
                onSwipe={handleSwipe}
                onSave={handleSave}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainPage;
