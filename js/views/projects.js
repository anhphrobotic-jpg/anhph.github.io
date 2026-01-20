// Projects View - Database Table + Detail
const ProjectsView = {
    currentSort: { column: 'updatedAt', direction: 'desc' },
    currentFilter: 'all',
    
    render() {
        return `
            <div class="page-header">
                <h1 class="page-title">Projects</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="alert('Add project feature coming soon')">
                        + New Project
                    </button>
                </div>
            </div>
            <div class="database-table">
                <div class="table-header">
                    <h3>All Projects</h3>
                    <div class="table-controls">
                        <input type="text" class="search-input" placeholder="Search projects..." id="projectSearch">
                        <select class="filter-select" id="projectFilter">
                            <option value="all">All Stages</option>
                            <option value="planning">Planning</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>
                <div id="projectsTableBody"></div>
            </div>
        `;
    },
    
    renderTable() {
        const projects = this.getFilteredProjects();
        const tbody = document.getElementById('projectsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th onclick="ProjectsView.sort('title')">Title</th>
                        <th onclick="ProjectsView.sort('stage')">Stage</th>
                        <th onclick="ProjectsView.sort('progress')">Progress</th>
                        <th>Tags</th>
                        <th onclick="ProjectsView.sort('updatedAt')">Updated</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(p => `
                        <tr onclick="App.navigate('projects/${p.id}')">
                            <td><strong>${p.title}</strong></td>
                            <td><span class="badge badge-${p.stage}">${this.formatStage(p.stage)}</span></td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${p.progress}%"></div>
                                </div>
                                <div class="text-xs text-muted">${p.progress}%</div>
                            </td>
                            <td><div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div></td>
                            <td class="text-sm text-secondary">${UI.formatDate(p.updatedAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    renderDetail(id) {
        const project = DataStore.getProject(id);
        if (!project) return '<div class="empty-state"><h3>Project not found</h3></div>';
        
        const tasks = DataStore.getTasksByProject(id);
        const papers = DataStore.getPapersByProject(id);
        const whiteboards = DataStore.getWhiteboardsByProject(id);
        
        return `
            <div class="detail-header">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h1 class="detail-title">${project.title}</h1>
                        <div class="detail-meta">
                            <span class="badge badge-${project.stage}">${this.formatStage(project.stage)}</span>
                            <span>Started ${UI.formatDate(project.startDate)}</span>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="App.navigate('projects')">← Back</button>
                </div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">${project.objective}</p>
                <div class="progress-bar" style="margin-top: 1rem;">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <div class="text-sm text-muted">${project.progress}% complete</div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">Related Tasks (${tasks.length})</h3>
                ${tasks.length > 0 ? `
                    <table>
                        <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Due Date</th></tr></thead>
                        <tbody>
                            ${tasks.map(t => `
                                <tr onclick="App.navigate('tasks')">
                                    <td>${t.title}</td>
                                    <td><span class="badge badge-${t.status}">${t.status}</span></td>
                                    <td><span class="badge badge-${t.priority}">${t.priority}</span></td>
                                    <td>${UI.formatDate(t.dueDate)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p class="text-secondary">No tasks yet</p>'}
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">Related Papers (${papers.length})</h3>
                ${papers.length > 0 ? papers.map(p => `
                    <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                        <a href="#papers/${p.id}" style="font-weight: 500;">${p.title}</a>
                        <div class="text-sm text-secondary">${p.authors} • ${p.journal} (${p.year})</div>
                    </div>
                `).join('') : '<p class="text-secondary">No papers yet</p>'}
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">Whiteboards (${whiteboards.length})</h3>
                ${whiteboards.length > 0 ? whiteboards.map(w => `
                    <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                        <a href="#whiteboards/${w.id}" style="font-weight: 500;">${w.title}</a>
                        <div class="text-sm text-secondary">${w.description}</div>
                    </div>
                `).join('') : '<p class="text-secondary">No whiteboards yet</p>'}
            </div>
        `;
    },
    
    getFilteredProjects() {
        let projects = DataStore.getProjects();
        if (this.currentFilter !== 'all') {
            projects = projects.filter(p => p.stage === this.currentFilter);
        }
        return this.sortProjects(projects);
    },
    
    sortProjects(projects) {
        const { column, direction } = this.currentSort;
        return [...projects].sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            if (direction === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });
    },
    
    sort(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = { column, direction: 'desc' };
        }
        this.renderTable();
    },
    
    formatStage(stage) {
        return stage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },
    
    init() {
        this.renderTable();
        const filter = document.getElementById('projectFilter');
        if (filter) {
            filter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTable();
            });
        }
    }
};
