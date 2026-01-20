// ===================================
// App Module - Dashboard Main Logic
// ===================================

const App = {
    currentFilters: {
        search: '',
        status: 'all',
        tag: 'all'
    },

    currentEditingProject: null,

    // ===================================
    // Initialization
    // ===================================

    init() {
        this.renderProjects();
        this.renderStats();
        this.populateTagFilter();
        this.bindEvents();
        this.registerShortcuts();
    },

    bindEvents() {
        // New Project Button
        const newProjectBtn = document.getElementById('newProjectBtn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.openNewProjectModal());
        }

        // Search Input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', UI.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.renderProjects();
            }, 300));
        }

        // Status Filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.renderProjects();
            });
        }

        // Tag Filter
        const tagFilter = document.getElementById('tagFilter');
        if (tagFilter) {
            tagFilter.addEventListener('change', (e) => {
                this.currentFilters.tag = e.target.value;
                this.renderProjects();
            });
        }

        // Project Form
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProjectSubmit();
            });
        }

        // Modal Close Buttons
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => UI.closeModal('projectModal'));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => UI.closeModal('projectModal'));
        }

        // Export / Import
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const fileInput = document.getElementById('fileInput');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => UI.triggerFileInput('fileInput'));
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.importData(e));
        }

        // Empty state button
        const emptyStateBtn = document.querySelector('.empty-state .btn-primary');
        if (emptyStateBtn) {
            emptyStateBtn.addEventListener('click', () => this.openNewProjectModal());
        }
    },

    registerShortcuts() {
        // Ctrl+N: New Project
        UI.registerShortcut('ctrl+n', () => {
            this.openNewProjectModal();
        });

        // Ctrl+E: Export
        UI.registerShortcut('ctrl+e', () => {
            this.exportData();
        });

        // Ctrl+I: Import
        UI.registerShortcut('ctrl+i', () => {
            UI.triggerFileInput('fileInput');
        });
    },

    // ===================================
    // Render Functions
    // ===================================

    renderProjects() {
        const projects = Storage.searchProjects(
            this.currentFilters.search,
            {
                status: this.currentFilters.status,
                tag: this.currentFilters.tag
            }
        );

        const grid = document.getElementById('projectsGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid) return;

        if (projects.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = projects
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map(project => this.createProjectCard(project))
            .join('');

        // Bind card events
        this.bindProjectCardEvents();
    },

    createProjectCard(project) {
        const statusClass = project.status.replace(' ', '-');
        const tagsHTML = project.tags
            .map(tag => `<span class="tag">${tag}</span>`)
            .join('');

        return `
            <div class="project-card" data-id="${project.id}">
                <div class="project-card-header">
                    <div>
                        <h3 class="project-card-title">${this.escapeHtml(project.title)}</h3>
                        <span class="status-badge ${statusClass}">${this.formatStatus(project.status)}</span>
                    </div>
                    <div class="project-card-actions">
                        <button class="btn-icon btn-edit" title="Edit">✏️</button>
                        <button class="btn-icon btn-delete" title="Delete">🗑️</button>
                    </div>
                </div>
                
                <p class="project-card-description">${this.escapeHtml(project.description) || 'No description'}</p>
                
                <div class="project-card-tags">
                    ${tagsHTML}
                </div>

                <div class="project-card-meta">
                    <span class="project-card-date">Created ${UI.formatDate(project.createdAt)}</span>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <span class="progress-text">${project.progress}% Complete</span>
            </div>
        `;
    },

    bindProjectCardEvents() {
        // Click on card to view details
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            const projectId = card.dataset.id;

            // Card click (not on buttons)
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-icon')) {
                    window.location.href = `project.html?id=${projectId}`;
                }
            });

            // Edit button
            const editBtn = card.querySelector('.btn-edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openEditProjectModal(projectId);
                });
            }

            // Delete button
            const deleteBtn = card.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteProject(projectId);
                });
            }
        });
    },

    renderStats() {
        const stats = Storage.getStats();

        const elements = {
            totalProjects: document.getElementById('totalProjects'),
            inProgressProjects: document.getElementById('inProgressProjects'),
            completedProjects: document.getElementById('completedProjects'),
            avgProgress: document.getElementById('avgProgress')
        };

        if (elements.totalProjects) elements.totalProjects.textContent = stats.total;
        if (elements.inProgressProjects) elements.inProgressProjects.textContent = stats.inProgress;
        if (elements.completedProjects) elements.completedProjects.textContent = stats.done;
        if (elements.avgProgress) elements.avgProgress.textContent = `${stats.avgProgress}%`;
    },

    populateTagFilter() {
        const tagFilter = document.getElementById('tagFilter');
        if (!tagFilter) return;

        const tags = Storage.getAllTags();
        
        // Keep "All Tags" option
        tagFilter.innerHTML = '<option value="all">All Tags</option>';
        
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    },

    // ===================================
    // Modal Functions
    // ===================================

    openNewProjectModal() {
        this.currentEditingProject = null;
        
        document.getElementById('modalTitle').textContent = 'New Project';
        UI.resetForm('projectForm');
        
        UI.openModal('projectModal');
        document.getElementById('projectTitle').focus();
    },

    openEditProjectModal(projectId) {
        const project = Storage.getProject(projectId);
        if (!project) return;

        this.currentEditingProject = project;
        
        document.getElementById('modalTitle').textContent = 'Edit Project';
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectProgress').value = project.progress;
        document.getElementById('projectTags').value = project.tags.join(', ');

        UI.openModal('projectModal');
        document.getElementById('projectTitle').focus();
    },

    handleProjectSubmit() {
        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const status = document.getElementById('projectStatus').value;
        const progress = parseInt(document.getElementById('projectProgress').value) || 0;
        const tagsInput = document.getElementById('projectTags').value.trim();
        
        const tags = tagsInput
            ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [];

        if (!title) {
            UI.showToast('Please enter a project title', 'error');
            return;
        }

        if (this.currentEditingProject) {
            // Update existing project
            Storage.updateProject(this.currentEditingProject.id, {
                title,
                description,
                status,
                progress,
                tags
            });

            UI.showToast('Project updated successfully!', 'success');
        } else {
            // Create new project
            Storage.createProject({
                title,
                description,
                status,
                progress,
                tags
            });

            UI.showToast('Project created successfully!', 'success');
        }

        UI.closeModal('projectModal');
        this.renderProjects();
        this.renderStats();
        this.populateTagFilter();
    },

    deleteProject(projectId) {
        UI.confirm('Are you sure you want to delete this project? This action cannot be undone.', () => {
            const success = Storage.deleteProject(projectId);
            
            if (success) {
                UI.showToast('Project deleted successfully', 'success');
                this.renderProjects();
                this.renderStats();
                this.populateTagFilter();
            } else {
                UI.showToast('Failed to delete project', 'error');
            }
        });
    },

    // ===================================
    // Export / Import
    // ===================================

    exportData() {
        const data = Storage.exportData();
        const filename = `research-projects-${Date.now()}.json`;
        
        UI.downloadJSON(data, filename);
        UI.showToast('Data exported successfully!', 'success');
    },

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        UI.readJSONFile(file, (content) => {
            const result = Storage.importData(content);
            
            if (result.success) {
                UI.showToast(`Successfully imported ${result.imported} projects!`, 'success');
                this.renderProjects();
                this.renderStats();
                this.populateTagFilter();
            } else {
                UI.showToast(`Import failed: ${result.error}`, 'error');
            }
        });

        // Reset file input
        event.target.value = '';
    },

    // ===================================
    // Utility Functions
    // ===================================

    formatStatus(status) {
        const statusMap = {
            'planning': 'Planning',
            'in-progress': 'In Progress',
            'done': 'Done'
        };
        return statusMap[status] || status;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
