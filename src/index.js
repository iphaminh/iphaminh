import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

const container = document.getElementById('root'); // Get the root container
const root = createRoot(container); // Create a root

root.render( // Use the root to render your app
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
