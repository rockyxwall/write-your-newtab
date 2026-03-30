// entrypoints/dashboard/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Or create your UI right here

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);