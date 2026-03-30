import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

// 1. Define an interface for your storage structure
interface WxtStorage {
  activeTemplateHtml?: string;
}

const STORAGE_KEY_ACTIVE_HTML = "activeTemplateHtml";

function NewTabApp() {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    // 2. Explicitly type the result of the storage call
    browser.storage.local.get(STORAGE_KEY_ACTIVE_HTML).then((result: WxtStorage) => {
      const savedHtml = result[STORAGE_KEY_ACTIVE_HTML];
      
      // result[key] is now recognized as string | undefined
      if (typeof savedHtml === 'string') {
        setHtmlContent(savedHtml);
      } else {
        setHtmlContent("welcome");
      }
    });

    // 3. OPTIONAL: Listen for changes so the tab updates without refreshing
    const listener = (changes: Record<string, any>) => {
      if (changes[STORAGE_KEY_ACTIVE_HTML]) {
        setHtmlContent(changes[STORAGE_KEY_ACTIVE_HTML].newValue || "welcome");
      }
    };
    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    // 4. Execute scripts after HTML is injected
    if (htmlContent && htmlContent !== "welcome") {
      const appContainer = document.getElementById('app-container');
      if (!appContainer) return;

      const scripts = appContainer.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        newScript.textContent = oldScript.textContent;
        // Copy other attributes if necessary (like type="module")
        if (oldScript.type) newScript.type = oldScript.type;
        
        document.body.appendChild(newScript);
        oldScript.remove();
      });
    }
  }, [htmlContent]);

  // 5. Fallback Welcome Screen
  if (htmlContent === "welcome") {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', 
        color: '#888', backgroundColor: '#1a1a1a', textAlign: 'center', gap: '1rem'
      }}>
        <h1 style={{ color: '#ccc', fontWeight: 300 }}>WYNTab is installed! 🎉</h1>
        <p style={{ opacity: 0.6 }}>Click the extension icon to open the dashboard.</p>
      </div>
    );
  }

  // 6. Render Injected Content
  return (
    <div 
      id="app-container" 
      dangerouslySetInnerHTML={{ __html: htmlContent || "" }} 
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NewTabApp />
  </React.StrictMode>,
);