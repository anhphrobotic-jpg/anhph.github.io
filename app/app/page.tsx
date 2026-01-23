/**
 * Legacy App Page
 * 
 * Serves the existing static HTML/CSS/JS application
 * while we progressively migrate features to Next.js
 * 
 * This allows both old and new code to coexist during migration.
 */

export default function LegacyAppPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Research Workspace</title>
        <link rel="stylesheet" href="/css/theme.css" />
        <link rel="stylesheet" href="/css/main.css" />
        <link rel="stylesheet" href="/css/blockEditorEnhanced.css" />
      </head>
      <body>
        {/* Mobile Header */}
        <header className="mobile-header">
          <button className="mobile-menu-toggle" id="mobileMenuToggle">
            <span className="hamburger"></span>
          </button>
          <h1 className="mobile-title">Research Workspace</h1>
          <button className="mobile-theme-toggle" id="mobileThemeToggle">
            <span className="theme-icon">🌙</span>
          </button>
        </header>

        {/* Main Layout */}
        <div className="app-container">
          {/* Sidebar Navigation */}
          <aside className="sidebar" id="sidebar">
            <div className="sidebar-header">
              <h1 className="sidebar-logo">
                <span className="logo-icon">📚</span>
                <span className="logo-text">Research</span>
              </h1>
              <button className="theme-toggle" id="themeToggle" title="Toggle theme">
                <span className="theme-icon">🌙</span>
              </button>
            </div>

            <nav className="sidebar-nav">
              <a href="#dashboard" className="nav-item active" data-view="dashboard">
                <span className="nav-icon">📊</span>
                <span className="nav-label">Dashboard</span>
              </a>
              <a href="#projects" className="nav-item" data-view="projects">
                <span className="nav-icon">🎯</span>
                <span className="nav-label">Projects</span>
              </a>
              <a href="#tasks" className="nav-item" data-view="tasks">
                <span className="nav-icon">✓</span>
                <span className="nav-label">Tasks</span>
              </a>
              <a href="#papers" className="nav-item" data-view="papers">
                <span className="nav-icon">📄</span>
                <span className="nav-label">Papers</span>
              </a>
              <a href="#whiteboards" className="nav-item" data-view="whiteboards">
                <span className="nav-icon">🎨</span>
                <span className="nav-label">Whiteboards</span>
              </a>
            </nav>

            <div className="sidebar-footer">
              <button className="export-btn" id="exportData" title="Export all data">
                📥 Export
              </button>
              <button className="import-btn" id="importData" title="Import data">
                📤 Import
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="main-content" id="mainContent">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          </main>
        </div>

        {/* Toast Notification */}
        <div className="toast" id="toast"></div>

        {/* Hidden file input */}
        <input type="file" id="fileInput" accept=".json" style={{ display: 'none' }} />

        {/* PDF.js Library (CDN) */}
        <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>

        {/* Cloudinary Storage */}
        <script src="/js/cloudinaryConfig.js"></script>

        {/* Core Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
          }
        `,
          }}
        />

        <script src="/js/pdfStorage.js"></script>
        <script src="/js/storage.js"></script>
        <script src="/js/ui.js"></script>

        {/* Components */}
        <script src="/js/components/sidebar.js"></script>
        <script src="/js/components/table.js"></script>
        <script src="/js/components/pdfViewer.js"></script>
        <script src="/js/components/blockEditor.js"></script>
        <script src="/js/components/blockEditorEnhanced.js"></script>

        {/* Views */}
        <script src="/js/views/dashboard.js"></script>
        <script src="/js/views/projects.js"></script>
        <script src="/js/views/tasks.js"></script>
        <script src="/js/views/papers.js"></script>
        <script src="/js/views/whiteboards.js"></script>

        {/* Main App (must load last) */}
        <script src="/js/app.js"></script>

        {/* Initialize App */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              App.init();
            });
          } else {
            App.init();
          }
        `,
          }}
        />
      </body>
    </html>
  )
}
