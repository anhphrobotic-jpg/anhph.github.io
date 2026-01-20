// Main Application Controller
const App = {
    currentView: null,
    
    async init() {
        console.log('Initializing Research Workspace...');
        
        // Load all data
        try {
            await DataStore.loadAll();
            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
        }
        
        // Initialize theme
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        
        // Initialize sidebar
        Sidebar.init();
        
        // Setup router
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    },
    
    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const [page, id] = hash.split('/');
        
        console.log('Navigating to:', page, id);
        
        // Update sidebar active state
        Sidebar.setActive(page);
        
        // Close mobile sidebar
        Sidebar.close();
        
        // Render appropriate view
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            console.error('Main content element not found');
            return;
        }
        
        try {
            switch (page) {
                case 'dashboard':
                    mainContent.innerHTML = DashboardView.render();
                    DashboardView.init();
                    break;
                    
                case 'projects':
                    if (id) {
                        mainContent.innerHTML = ProjectsView.renderDetail(id);
                    } else {
                        mainContent.innerHTML = ProjectsView.render();
                        ProjectsView.init();
                    }
                    break;
                    
                case 'tasks':
                    mainContent.innerHTML = TasksView.render();
                    TasksView.init();
                    break;
                    
                case 'papers':
                    if (id) {
                        mainContent.innerHTML = PapersView.renderDetail(id);
                        // Load PDF viewer after DOM is ready
                        setTimeout(() => PDFViewer.load(id), 100);
                    } else {
                        mainContent.innerHTML = PapersView.render();
                        PapersView.init();
                    }
                    break;
                    
                case 'whiteboards':
                    if (id) {
                        mainContent.innerHTML = WhiteboardsView.renderDetail(id);
                    } else {
                        mainContent.innerHTML = WhiteboardsView.render();
                        WhiteboardsView.init();
                    }
                    break;
                    
                default:
                    mainContent.innerHTML = '<div class="empty-state"><h3>Page not found</h3></div>';
            }
        } catch (error) {
            console.error('Error rendering view:', error);
            mainContent.innerHTML = `
                <div class="empty-state">
                    <h3>Error loading page</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    },
    
    navigate(path) {
        window.location.hash = path;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
