import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import '../styles/createProject.css';

const categories = ["Software", "Design", "Research", "Business", "Competition"];
const projectTypes = ["Academic", "Professional", "Hobby", "Startup", "Hackathon"];

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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          skillsRequired: form.skillsRequired.split(',').map(s => s.trim()),
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
    } catch (err) {
      setError('Failed to create project.');
    }
  };

  return (
    <div className="create-project-page">
      <form className="create-project-form" onSubmit={handleSubmit}>
        <h2>Create a New Project</h2>
        <input name="title" type="text" placeholder="Project Title" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="location" type="text" placeholder="Location" value={form.location} onChange={handleChange} required />
        <input name="skillsRequired" type="text" placeholder="Skills (comma separated)" value={form.skillsRequired} onChange={handleChange} required />
        <input name="maxMembers" type="number" placeholder="Max Members" value={form.maxMembers} onChange={handleChange} required min={1} />
        <select name="category" value={form.category} onChange={handleChange} required>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select name="projectType" value={form.projectType} onChange={handleChange} required>
          {projectTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <button type="submit">Create Project</button>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
};

export default CreateProject;