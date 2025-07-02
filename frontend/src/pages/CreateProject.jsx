import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import '../styles/createProject.css';
import PropTypes from 'prop-types';

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const inputRef = useRef(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    // Add more detailed logging
    console.log('Places library loaded:', placesLib);
    console.log('Window.google available:', !!window.google);
    console.log('Input ref current:', !!inputRef.current);

    if (!placesLib || !window.google?.maps?.places || !inputRef.current) {
      console.log('Autocomplete not ready yet');
      return;
    }

    console.log('Initializing autocomplete');

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ['geometry', 'name', 'formatted_address'],
          types: ['address'],
        },
      );

      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log('Place selected:', place);
        onPlaceSelect(place);
      });

      return () => {
        console.log('Cleaning up autocomplete');
        if (window.google?.maps?.event) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }, [placesLib, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter a location"
      className="your-autocomplete-input-class"
    />
  );
};

PlaceAutocomplete.propTypes = {
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
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceSelect = (place) => {
    console.log('Place selected in parent:', place);
    setForm((prev) => ({
      ...prev,
      location: place.formatted_address || place.name || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in.');
      return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.projects, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          skillsRequired: form.skillsRequired.split(',').map((s) => s.trim()),
          maxMembers: Number(form.maxMembers),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Project created successfully!');
        setTimeout(() => navigate('/mainPage'), 1200);
      } else {
        setError(data.message || 'Failed to create project.');
      }
    } catch {
      setError('Failed to create project.');
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
        <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />

        <input
          name="skillsRequired"
          type="text"
          placeholder="Skills (comma separated)"
          value={form.skillsRequired}
          onChange={handleChange}
          required
        />
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
        <button type="submit">Create Project</button>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
};

export default CreateProject;
