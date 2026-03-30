// entrypoints/dashboard/App.tsx
import React, { useState, useEffect } from 'react';
import './style.css';

function App() {
  const [activeTemplate, setActiveTemplate] = useState('Loading...');
  const [status, setStatus] = useState({ message: '', type: '' });

  // Logic to handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStatus({ message: `Uploading ${file.name}...`, type: 'info' });
      // Your upload logic here (e.g., reading file as text and saving to storage)
    }
  };

  return (
    <div className="dashboard-container">
      {/* TOP NAVIGATION BAR */}
      <nav className="topbar">
        <div className="topbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">WYNTab</span>
        </div>
        <span className="topbar-sub">New Tab Manager</span>
      </nav>

      {/* MAIN PAGE CONTENT */}
      <main className="page">
        {/* SECTION 1: ACTIVE TEMPLATE */}
        <section className="section">
          <h2 className="section-title">Active Template</h2>
          <div className="active-card" id="activeCard">
            <div className="active-card-info">
              <span className="active-badge">LIVE</span>
              <span className="active-name">{activeTemplate}</span>
            </div>
            <button 
              className="btn btn-ghost" 
              onClick={() => console.log('Exporting...')}
              title="Download active HTML as a file"
            >
              ↓ Export Backup
            </button>
          </div>
        </section>

        {/* SECTION 2: TEMPLATE LIBRARY */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Template Library</h2>
            <label className="btn btn-primary" htmlFor="fileInput">
              + Upload HTML
            </label>
          </div>

          <input
            type="file"
            id="fileInput"
            accept=".html"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {status.message && (
            <div className={`status-bar ${status.type}`} role="alert">
              {status.message}
            </div>
          )}

          <div className="template-grid">
            {/* You would map over your templates here */}
            <p style={{ color: '#666' }}>No templates uploaded yet.</p>
          </div>
        </section>

        {/* SECTION 3: HELP / INFO */}
        <section className="section section-help">
          <h3 className="help-title">How to use WYNTab</h3>
          <div className="help-grid">
            {[
              "Click Upload HTML to add your own custom tab page.",
              "Click Activate on any template to set it as your new tab.",
              "Use Export Backup to download your HTML before clearing data.",
              "All data is stored locally — nothing is sent to the internet."
            ].map((text, i) => (
              <div key={i} className="help-item">
                <span className="help-num">0{i + 1}</span>
                <p dangerouslySetInnerHTML={{ __html: text.replace('Upload HTML', '<strong>Upload HTML</strong>').replace('Activate', '<strong>Activate</strong>').replace('Export Backup', '<strong>Export Backup</strong>').replace('locally', '<strong>locally</strong>') }} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;