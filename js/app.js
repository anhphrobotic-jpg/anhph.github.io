// Main Application Controller
window.App = {
    currentView: null,
    
    async init() {
        console.log('Initializing Research Workspace...');
        
        // Load all data (localStorage first, then JSON files as fallback)
        try {
            await DataStore.loadAll();
            console.log('✓ Data loaded successfully');
            console.log('  Projects:', DataStore.data.projects.length);
            console.log('  Tasks:', DataStore.data.tasks.length);
            console.log('  Papers:', DataStore.data.papers.length);
            console.log('  Whiteboards:', DataStore.data.whiteboards.length);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        
        // Auto-backup to Cloudinary every 5 minutes
        this.setupAutoBackup();
        
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
        const parts = hash.split('/');
        const page = parts[0];
        const id = parts[1];
        const subpage = parts[2];
        const subId = parts[3];
        
        console.log('Navigating to:', { page, id, subpage, subId });
        
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
                    if (subpage === 'note' && id && subId) {
                        // Project note: #projects/proj_1/note/note_project_proj_1_123
                        ProjectsView.renderNoteEditor(id, subId);
                    } else if (subpage === 'task-note' && id && subId) {
                        // Task note: #projects/proj_1/task-note/task_1
                        const task = DataStore.getTasks().find(t => t.id === subId);
                        if (task) {
                            ProjectsView.renderTaskNoteEditor(id, subId, task.title);
                        }
                    } else if (subpage === 'paper-note' && id && subId) {
                        // Paper note: #projects/proj_1/paper-note/paper_1
                        const paper = DataStore.getPaper(subId);
                        if (paper) {
                            ProjectsView.renderPaperNoteEditor(id, subId, paper.title);
                        }
                    } else if (id) {
                        mainContent.innerHTML = ProjectsView.renderDetail(id);
                        ProjectsView.init();
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
                        console.log('Loading paper detail for:', id);
                        mainContent.innerHTML = PapersView.renderDetail(id);
                        PapersView.init();
                        // Load PDF viewer after DOM is ready
                        console.log('Scheduling PDFViewer.load for paper:', id);
                        setTimeout(() => {
                            console.log('Calling PDFViewer.load now');
                            PDFViewer.load(id);
                        }, 100);
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
    },
    
    setupAutoBackup() {
        // Periodic backup every 2 minutes (as safety net)
        setInterval(async () => {
            try {
                console.log('⏰ Periodic backup to Cloudinary...');
                this.showSaveIndicator('saving');
                await DataStore.backupToCloudinary();
                this.showSaveIndicator('saved');
                console.log('✓ Periodic backup complete');
            } catch (error) {
                console.error('Periodic backup failed:', error);
                this.showSaveIndicator('error');
            }
        }, 2 * 60 * 1000); // 2 minutes
        
        // Also backup when user leaves the page
        window.addEventListener('beforeunload', async () => {
            try {
                await DataStore.backupToCloudinary();
            } catch (error) {
                console.error('Backup on exit failed:', error);
            }
        });
    },
    
    showSaveIndicator(state) {
        let indicator = document.getElementById('saveIndicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'saveIndicator';
            indicator.className = 'save-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.className = 'save-indicator ' + state;
        
        if (state === 'saving') {
            indicator.innerHTML = '☁️ Đang lưu...';
        } else if (state === 'saved') {
            indicator.innerHTML = '✓ Đã lưu';
            setTimeout(() => {
                indicator.classList.add('fade-out');
                setTimeout(() => {
                    indicator.classList.remove('fade-out');
                    indicator.className = 'save-indicator';
                }, 1000);
            }, 2000);
        } else if (state === 'error') {
            indicator.innerHTML = '⚠️ Lỗi lưu';
            setTimeout(() => {
                indicator.classList.add('fade-out');
                setTimeout(() => {
                    indicator.classList.remove('fade-out');
                    indicator.className = 'save-indicator';
                }, 1000);
            }, 3000);
        }
    },
    
    async manualBackup() {
        try {
            UI.showToast('Backing up to Cloudinary...', 'info');
            const result = await DataStore.backupToCloudinary();
            UI.showToast('✓ Backup successful!', 'success');
            return result;
        } catch (error) {
            UI.showToast('Backup failed: ' + error.message, 'error');
            throw error;
        }
    },
    
    async restoreBackup(backupUrl) {
        if (!confirm('This will replace all current data. Continue?')) {
            return;
        }
        
        try {
            UI.showToast('Restoring from backup...', 'info');
            await DataStore.restoreFromCloudinary(backupUrl);
            UI.showToast('✓ Restore successful! Reloading...', 'success');
            
            // Reload the page to reflect changes
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            UI.showToast('Restore failed: ' + error.message, 'error');
            throw error;
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});
