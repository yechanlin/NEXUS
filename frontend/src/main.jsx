import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <APIProvider apiKey={API_KEY} libraries={['places']}>
      <App />
    </APIProvider>
  </StrictMode>,
);
