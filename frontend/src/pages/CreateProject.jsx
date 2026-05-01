import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';
import '../styles/createProject.css';
import PropTypes from 'prop-types';
import { ALL_AVAILABLE_SKILLS } from '../constants/skills';

const PlaceAutocomplete = ({ value, onChange, onPlaceSelect }) => {
  const inputRef = useRef(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !window.google?.maps?.places || !inputRef.current) return;

    let autocomplete;
    let listener;
    try {
      autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { fields: ['geometry', 'name', 'formatted_address'], types: ['address'] },
      );
      listener = autocomplete.addListener('place_changed', () => {
        onPlaceSelect(autocomplete.getPlace());
      });
    } catch {
      // Google Maps failed — fall back to plain text input below
    }
    return () => {
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [placesLib, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      name="location"
      type="text"
      placeholder="City, Country (or Remote)"
      value={value}
      onChange={onChange}
      required
    />
  );
};

PlaceAutocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onPlaceSelect: PropTypes.func.isRequired,
};

const categories = [
  'Software',
  'Design',
  'Research',
  'Business',
  'Competition',
];

const projectTypes = [
  'Academic',
  'Professional',
  'Hobby',
  'Startup',
  'Hackathon',
];

const CreateProject = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    skillsRequired: '',
    maxMembers: '',
    category: categories[0],
    projectType: projectTypes[0],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const skillsInputRef = useRef(null);
  const suggestionsContainerRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'skillsRequired') {
      generateSkillSuggestions(value);
    }
  };

  const handlePlaceSelect = (place) => {
    setForm((prev) => ({
      ...prev,
      location: place.formatted_address || place.name || '',
    }));
  };

  const generateSkillSuggestions = (inputString) => {
    const parts = inputString.split(',').map((s) => s.trim());
    const lastPart = parts[parts.length - 1].toLowerCase();

    if (lastPart.length < 2) {
      setSkillSuggestions([]);
      setShowSkillSuggestions(false);
      return;
    }

    const currentSkills = parts.slice(0, -1).map((s) => s.toLowerCase());
    const filtered = ALL_AVAILABLE_SKILLS.filter((skill) => {
      const lowerCaseSkill = skill.toLowerCase();
      return (
        lowerCaseSkill.includes(lastPart) &&
        !currentSkills.includes(lowerCaseSkill)
      );
    }).slice(0, 7);

    setSkillSuggestions(filtered);
    setShowSkillSuggestions(filtered.length > 0);
  };

  const handleSkillSuggestionClick = (suggestedSkill) => {
    const currentInput = form.skillsRequired;
    const parts = currentInput.split(',').map((s) => s.trim());
    const lastPartIndex = parts.length - 1;

    parts[lastPartIndex] = suggestedSkill;

    let newSkillsString = parts.join(', ');

    if (suggestedSkill && !newSkillsString.endsWith(', ')) {
      newSkillsString += ', ';
    }

    setForm((prev) => ({
      ...prev,
      skillsRequired: newSkillsString,
    }));

    setSkillSuggestions([]);
    setShowSkillSuggestions(false);
    skillsInputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        skillsInputRef.current &&
        !skillsInputRef.current.contains(event.target) &&
        !suggestionsContainerRef.current?.contains(event.target)
      ) {
        setShowSkillSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) { setError('You must be logged in.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.projects, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          skillsRequired: form.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
          maxMembers: Number(form.maxMembers),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Project created successfully!');
        setTimeout(() => navigate('/my-projects'), 1200);
      } else {
        setError(data.message || 'Failed to create project.');
        toast.error(data.message || 'Failed to create project.');
      }
    } catch {
      setError('Failed to create project.');
      toast.error('Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-project-page">
      <form className="create-project-form" onSubmit={handleSubmit}>
        <h2>Create a New Project</h2>
        <input
          name="title"
          type="text"
          placeholder="Project Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <PlaceAutocomplete
          value={form.location}
          onChange={handleChange}
          onPlaceSelect={handlePlaceSelect}
        />

        <div className="skills-input-container">
          <input
            name="skillsRequired"
            type="text"
            placeholder="Skills (comma separated)"
            value={form.skillsRequired}
            onChange={handleChange}
            required
            ref={skillsInputRef}
            onFocus={() => generateSkillSuggestions(form.skillsRequired)}
          />
          {showSkillSuggestions && skillSuggestions.length > 0 && (
            <div
              className="skill-suggestions-dropdown"
              ref={suggestionsContainerRef}
            >
              {skillSuggestions.map((skill) => (
                <div
                  key={skill}
                  className="skill-suggestion-item"
                  onClick={() => handleSkillSuggestionClick(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          name="maxMembers"
          type="number"
          placeholder="Max Members"
          value={form.maxMembers}
          onChange={handleChange}
          required
          min={1}
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          name="projectType"
          value={form.projectType}
          onChange={handleChange}
          required
        >
          {projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Project'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default CreateProject;
