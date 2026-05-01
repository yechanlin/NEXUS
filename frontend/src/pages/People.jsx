import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiUsers, FiBookOpen, FiMapPin } from 'react-icons/fi';
import { API_ENDPOINTS, apiCall } from '../config/api';
import '../styles/people.css';

const People = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await apiCall(API_ENDPOINTS.searchUsers(query.trim()));
        setResults(data?.data?.users || []);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 280);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="people-page">
      <div className="people-container">
        <header className="people-header">
          <div className="people-header-icon"><FiUsers size={20} /></div>
          <div>
            <h1>Find People</h1>
            <p>Search by name, school, or field of study to reconnect or discover new collaborators.</p>
          </div>
        </header>

        <div className="people-search-wrap">
          <FiSearch className="people-search-icon" size={16} />
          <input
            className="people-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, school, or field…"
            autoFocus
          />
          {loading && <span className="people-search-spinner" />}
        </div>

        <div className="people-results">
          {!searched && !query && (
            <div className="people-hint">
              <FiSearch size={32} />
              <p>Start typing to find someone you've worked with — or someone new.</p>
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="people-hint">
              <FiSearch size={32} />
              <p>No people matched "<strong>{query}</strong>"</p>
              <span className="people-hint-sub">Try a different name, school, or field.</span>
            </div>
          )}

          {results.map((u) => (
            <Link key={u._id} to={`/profile/${u._id}`} className="people-card">
              <div className="people-avatar">
                {u.profilePicture && !u.profilePicture.includes('placeholder') ? (
                  <img src={u.profilePicture} alt={u.userName} />
                ) : (
                  <span>{(u.userName || '?').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="people-card-body">
                <div className="people-card-name">{u.userName || 'Unnamed'}</div>
                <div className="people-card-meta">
                  {u.fieldOfStudy && (
                    <span><FiBookOpen size={11} /> {u.fieldOfStudy}</span>
                  )}
                  {u.school && (
                    <span><FiMapPin size={11} /> {u.school}</span>
                  )}
                </div>
                {u.bio && <p className="people-card-bio">{u.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default People;
