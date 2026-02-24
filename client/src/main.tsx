import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Notice: Removed the .jsx extension!
import './index.css';

// Added 'as HTMLElement' so TypeScript knows this element definitely exists
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);