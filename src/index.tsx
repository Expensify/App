import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import ScrollRestoration from './ScrollRestoration';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Attach scroll restoration logic */}
      <ScrollRestoration />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
