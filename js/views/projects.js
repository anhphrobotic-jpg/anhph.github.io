// ================================================
// PROJECT-CENTRIC VIEW - Full Workspace
// ================================================
// Each project page is a self-contained research hub
// with editable tasks, papers, and whiteboards

const ProjectsView = {
    currentSort: { key: 'updatedAt', order: 'desc' },
    currentFilter: 'all',
    
    // ========================================
    // LIST VIEW - All Projects
    // ========================================
    
    render() {
        return `
            <div class="page-header">
                <h1 class="page-title">Research Projects</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="alert('Create project feature coming soon')">+ New Project</button>
                </div>
            </div>
            <div class="database-table">
                <div class="table-header">
                    <h3>All Projects</h3>
                    <div class="table-controls">
                        <input type="text" class="search-input" placeholder="Search projects..." onkeyup="ProjectsView.filterProjects(this.value)">
                        <select class="filter-select" id="projectFilter" onchange="ProjectsView.setFilter(this.value)">
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
                        <th onclick="ProjectsView.sort('updatedAt')">Updated</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(p => `
                        <tr onclick="App.navigate('projects/${p.id}')">
                            <td><strong>${p.title}</strong></td>
                            <td><span class="badge badge-${p.stage}">${p.stage}</span></td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${p.progress}%"></div>
                                    <span class="progress-text">${p.progress}%</span>
                                </div>
                            </td>
                            <td class="text-sm text-secondary">${UI.formatDate(p.updatedAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    // ========================================
    // PROJECT DETAIL VIEW - Research Workspace
    // ========================================
    
    renderDetail(id) {
        const project = DataStore.getProject(id);
        if (!project) {
            return '<div class="empty-state"><h3>Project not found</h3></div>';
        }
        
        const tasks = DataStore.getTasksByProject(id);
        const papers = DataStore.getPapersByProject(id);
        const whiteboards = DataStore.getWhiteboardsByProject(id);
        
        return `
            <div class="project-workspace">
                ${this.renderProjectHeader(project)}
                ${this.renderTasksSection(project.id, tasks)}
                ${this.renderPapersSection(project.id, papers)}
                ${this.renderNotesSection(project.id)}
                ${this.renderWhiteboardsSection(project.id, whiteboards)}
            </div>
        `;
    },
    
    // ========================================
    // PROJECT HEADER - Research Context
    // ========================================
    
    renderProjectHeader(project) {
        return `
            <div class="project-header">
                <button class="btn btn-secondary btn-sm" onclick="App.navigate('projects')">← Back to Projects</button>
                
                <div class="project-title-row">
                    <h1 class="project-title">${project.title}</h1>
                    <span class="badge badge-${project.stage}">${project.stage}</span>
                </div>
                
                <div class="project-meta">
                    <div class="meta-item">
                        <strong>Progress:</strong>
                        <div class="progress-bar" style="width: 200px; display: inline-block; vertical-align: middle;">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                            <span class="progress-text">${project.progress}%</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <strong>Started:</strong> ${UI.formatDate(project.startDate)}
                    </div>
                    <div class="meta-item">
                        <strong>Tags:</strong> ${(project.tags || []).map(t => `<span class="tag">${t}</span>`).join(' ')}
                    </div>
                </div>
                
                <div class="project-objective">
                    <h3>🎯 Objective</h3>
                    <p>${project.objective || 'No objective defined'}</p>
                </div>
                
                ${project.keyQuestions && project.keyQuestions.length > 0 ? `
                    <div class="project-key-questions">
                        <h3>❓ Key Research Questions</h3>
                        <ul>
                            ${project.keyQuestions.map(q => `<li>${q}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="project-status-grid">
                    ${project.currentBlocker ? `
                        <div class="status-card status-blocker">
                            <strong>🚫 Current Blocker</strong>
                            <p>${project.currentBlocker}</p>
                        </div>
                    ` : ''}
                    
                    ${project.lastDecision ? `
                        <div class="status-card status-decision">
                            <strong>💡 Last Decision</strong>
                            <p>${project.lastDecision}</p>
                        </div>
                    ` : ''}
                    
                    ${project.nextAction ? `
                        <div class="status-card status-action">
                            <strong>⚡ Next Action</strong>
                            <p>${project.nextAction}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // ========================================
    // TASKS SECTION - Editable Table
    // ========================================
    
    renderTasksSection(projectId, tasks) {
        const tasksByStatus = {
            todo: tasks.filter(t => t.status === 'todo'),
            'in-progress': tasks.filter(t => t.status === 'in-progress'),
            done: tasks.filter(t => t.status === 'done')
        };
        
        return `
            <div class="project-section">
                <div class="section-header">
                    <h2>✅ Tasks & Actions</h2>
                    <button class="btn btn-primary btn-sm" onclick="ProjectsView.showAddTaskModal('${projectId}')">+ Add Task</button>
                </div>
                
                <div class="tasks-table-container">
                    <table class="editable-table">
                        <thead>
                            <tr>
                                <th style="width: 35%">Title</th>
                                <th style="width: 15%">
                                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                                        <span>Type</span>
                                        <select class="inline-select" style="font-size: 0.75rem; padding: 0.125rem 0.25rem;" onchange="ProjectsView.filterTasksByType('${projectId}', this.value)">
                                            <option value="">All</option>
                                            <option value="research">🔬 Research</option>
                                            <option value="data">📊 Data</option>
                                            <option value="implementation">💻 Implementation</option>
                                            <option value="experiment">🧪 Experiment</option>
                                            <option value="writing">✍️ Writing</option>
                                            <option value="admin">📁 Admin</option>
                                            <option value="meeting">💬 Meeting</option>
                                        </select>
                                    </div>
                                </th>
                                <th style="width: 15%">
                                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                                        <span>Status</span>
                                        <select class="inline-select" style="font-size: 0.75rem; padding: 0.125rem 0.25rem;" onchange="ProjectsView.filterTasksByStatus('${projectId}', this.value)">
                                            <option value="">All</option>
                                            <option value="todo">📋 Todo</option>
                                            <option value="in-progress">🔄 In Progress</option>
                                            <option value="done">✅ Done</option>
                                        </select>
                                    </div>
                                </th>
                                <th style="width: 12%">Tag</th>
                                <th style="width: 8%" title="Notes">📝</th>
                                <th style="width: 15%">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.length === 0 ? `
                                <tr><td colspan="6" class="empty-cell">No tasks yet. Click "+ Add Task" to get started.</td></tr>
                            ` : tasks.map(task => this.renderTaskRow(task)).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="task-summary">
                    <span class="summary-stat">📋 Todo: ${tasksByStatus.todo.length}</span>
                    <span class="summary-stat">🔄 In Progress: ${tasksByStatus['in-progress'].length}</span>
                    <span class="summary-stat">✅ Done: ${tasksByStatus.done.length}</span>
                </div>
            </div>
        `;
    },
    
    renderTaskRow(task) {
        // Get task note from localStorage
        const noteId = `note_task_${task.id}`;
        const noteData = localStorage.getItem(noteId);
        let notesPreview = 'Click to add notes';
        
        if (noteData) {
            try {
                const note = JSON.parse(noteData);
                const preview = this.getTaskNotePreview(note);
                notesPreview = preview || 'Click to edit notes';
            } catch (e) {
                console.error('Error parsing task note:', e);
            }
        }
        
        return `
            <tr data-task-id="${task.id}">
                <td class="editable-cell" onclick="ProjectsView.editTaskInline('${task.id}', 'title', this)">
                    <strong>${task.title}</strong>
                </td>
                <td>
                    <select class="inline-select task-type-select task-type-${task.type}" onchange="ProjectsView.updateTaskField('${task.id}', 'type', this.value)">
                        <option value="research" ${task.type === 'research' ? 'selected' : ''}>🔬 Research</option>
                        <option value="data" ${task.type === 'data' ? 'selected' : ''}>📊 Data</option>
                        <option value="implementation" ${task.type === 'implementation' ? 'selected' : ''}>💻 Implementation</option>
                        <option value="experiment" ${task.type === 'experiment' ? 'selected' : ''}>🧪 Experiment</option>
                        <option value="writing" ${task.type === 'writing' ? 'selected' : ''}>✍️ Writing</option>
                        <option value="admin" ${task.type === 'admin' ? 'selected' : ''}>📁 Admin</option>
                        <option value="meeting" ${task.type === 'meeting' ? 'selected' : ''}>💬 Meeting</option>
                    </select>
                </td>
                <td>
                    <select class="inline-select task-status-select task-status-${task.status}" onchange="ProjectsView.updateTaskField('${task.id}', 'status', this.value)">
                        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>📋 Todo</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>🔄 In Progress</option>
                        <option value="done" ${task.status === 'done' ? 'selected' : ''}>✅ Done</option>
                    </select>
                </td>
                <td class="editable-cell" onclick="ProjectsView.editTaskInline('${task.id}', 'tag', this)">
                    <span class="task-tag">${task.tag ? '🏷️ ' + task.tag : '<span style="color: var(--text-muted); font-style: italic;">Add tag</span>'}</span>
                </td>
                <td class="notes-preview-cell" style="cursor: pointer; text-align: center;" onclick="ProjectsView.openTaskNote('${task.projectId}', '${task.id}', '${task.title}')" title="${notesPreview}">
                    <span class="notes-icon" style="font-size: 1.25rem;">📝</span>
                </td>
                <td class="action-cell">
                    <button class="btn-icon" onclick="ProjectsView.showEditTaskModal('${task.id}')" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="ProjectsView.deleteTask('${task.id}')" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    },
    
    // ========================================
    // PAPERS SECTION - Editable Table
    // ========================================
    
    renderPapersSection(projectId, papers) {
        const papersByImportance = {
            critical: papers.filter(p => p.importance === 'critical'),
            high: papers.filter(p => p.importance === 'high'),
            medium: papers.filter(p => p.importance === 'medium')
        };
        
        return `
            <div class="project-section">
                <div class="section-header">
                    <h2>📚 Papers & References</h2>
                    <button class="btn btn-primary btn-sm" onclick="ProjectsView.showAddPaperModal('${projectId}')">+ Add Paper</button>
                </div>
                
                <div class="papers-table-container">
                    <table class="editable-table">
                        <thead>
                            <tr>
                                <th style="width: 30%">Title</th>
                                <th style="width: 13%">Journal/Venue</th>
                                <th style="width: 7%">Year</th>
                                <th style="width: 13%">
                                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                                        <span>Status</span>
                                        <select class="inline-select" style="font-size: 0.75rem; padding: 0.125rem 0.25rem;" onchange="ProjectsView.filterPapersByStatus('${projectId}', this.value)">
                                            <option value="">All</option>
                                            <option value="to-read">To Read</option>
                                            <option value="reading">Reading</option>
                                            <option value="read">Read</option>
                                        </select>
                                    </div>
                                </th>
                                <th style="width: 13%">
                                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                                        <span>Importance</span>
                                        <select class="inline-select" style="font-size: 0.75rem; padding: 0.125rem 0.25rem;" onchange="ProjectsView.filterPapersByImportance('${projectId}', this.value)">
                                            <option value="">All</option>
                                            <option value="critical">🔥 Critical</option>
                                            <option value="high">⚡ High</option>
                                            <option value="medium">📄 Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </th>
                                <th style="width: 18%">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${papers.length === 0 ? `
                                <tr><td colspan="6" class="empty-cell">No papers yet. Click "+ Add Paper" to start building your literature review.</td></tr>
                            ` : papers.map(paper => this.renderPaperRow(paper)).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="paper-summary">
                    <span class="summary-stat">🔥 Critical: ${papersByImportance.critical.length}</span>
                    <span class="summary-stat">⚡ High: ${papersByImportance.high.length}</span>
                    <span class="summary-stat">📄 Medium: ${papersByImportance.medium.length}</span>
                </div>
            </div>
        `;
    },
    
    renderPaperRow(paper) {
        // Get paper note preview
        const noteId = `note_paper_${paper.id}`;
        const noteData = localStorage.getItem(noteId);
        let notesPreview = 'Click to add notes';
        
        if (noteData) {
            try {
                const note = JSON.parse(noteData);
                const preview = this.getTaskNotePreview(note);
                notesPreview = preview || 'Click to edit notes';
            } catch (e) {
                console.error('Error parsing paper note:', e);
            }
        }
        
        return `
            <tr data-paper-id="${paper.id}">
                <td style="cursor: pointer;" onclick="App.navigate('papers/${paper.id}')">
                    <strong>${paper.title}</strong>
                    ${paper.keyTakeaways && paper.keyTakeaways.length > 0 ? '<span class="badge-mini">💡</span>' : ''}
                    ${paper.hasPDF ? '<span class="badge-mini">📎</span>' : ''}
                </td>
                <td class="text-sm">${paper.journal || ''}</td>
                <td class="text-sm">${paper.year || ''}</td>
                <td onclick="event.stopPropagation()">
                    <select class="inline-select" onchange="ProjectsView.updatePaperField('${paper.id}', 'status', this.value)">
                        <option value="to-read" ${paper.status === 'to-read' ? 'selected' : ''}>To Read</option>
                        <option value="reading" ${paper.status === 'reading' ? 'selected' : ''}>Reading</option>
                        <option value="read" ${paper.status === 'read' ? 'selected' : ''}>Read</option>
                    </select>
                </td>
                <td onclick="event.stopPropagation()">
                    <select class="inline-select" onchange="ProjectsView.updatePaperField('${paper.id}', 'importance', this.value)">
                        <option value="critical" ${paper.importance === 'critical' ? 'selected' : ''}>🔥 Critical</option>
                        <option value="high" ${paper.importance === 'high' ? 'selected' : ''}>⚡ High</option>
                        <option value="medium" ${paper.importance === 'medium' ? 'selected' : ''}>📄 Medium</option>
                        <option value="low" ${paper.importance === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </td>
                <td class="action-cell" onclick="event.stopPropagation()">
                    <button class="btn-icon" onclick="App.navigate('papers/${paper.id}')" title="View Details">👁️</button>
                    <button class="btn-icon" onclick="ProjectsView.showEditPaperModal('${paper.id}')" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="ProjectsView.deletePaper('${paper.id}')" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    },
    
    // ========================================
    // WHITEBOARDS SECTION
    // ========================================
    
    renderWhiteboardsSection(projectId, whiteboards) {
        return `
            <div class="project-section">
                <div class="section-header">
                    <h2>🎨 Whiteboards</h2>
                    <button class="btn btn-primary btn-sm" onclick="alert('Create whiteboard feature coming soon')">+ New Whiteboard</button>
                </div>
                
                ${whiteboards.length === 0 ? `
                    <div class="empty-state-small">
                        <p>No whiteboards yet. Create one to brainstorm ideas visually.</p>
                    </div>
                ` : `
                    <div class="whiteboard-grid">
                        ${whiteboards.map(w => `
                            <div class="whiteboard-card" onclick="App.navigate('whiteboards/${w.id}')">
                                <strong>${w.title}</strong>
                                <p class="text-sm text-secondary">${w.description}</p>
                                <span class="text-xs text-secondary">Updated ${UI.formatDate(w.updatedAt)}</span>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    },
    
    // ========================================
    // TASK NOTE PREVIEW & EDITOR
    // ========================================
    
    getTaskNotePreview(note) {
        if (!note || !note.blocks || note.blocks.length === 0) {
            return '';
        }
        
        // Get first 2 blocks
        const previewBlocks = note.blocks.slice(0, 2);
        const texts = previewBlocks
            .map(block => {
                const content = block.content || '';
                // Strip HTML tags
                const text = content.replace(/<[^>]*>/g, '');
                return text.trim();
            })
            .filter(text => text.length > 0);
        
        const previewText = texts.join(' ');
        // Truncate to 60 characters
        return previewText.length > 60 ? previewText.substring(0, 60) + '...' : previewText;
    },
    
    openTaskNote(projectId, taskId, taskTitle) {
        // Navigate using hash to enable browser back button
        window.location.hash = `#projects/${projectId}/task-note/${taskId}`;
    },
    
    renderTaskNoteEditor(projectId, taskId, taskTitle) {
        const task = DataStore.getTasks().find(t => t.id === taskId);
        if (!task) {
            UI.showToast('Task not found', 'error');
            window.location.hash = `#projects/${projectId}`;
            return;
        }
        
        const noteId = `note_task_${taskId}`;
        const project = DataStore.getProject(projectId);
        const projectName = project ? (project.name || project.title || 'Project') : 'Project';
        
        // Get or create note
        let note = JSON.parse(localStorage.getItem(noteId));
        if (!note) {
            note = {
                id: noteId,
                taskId: taskId,
                projectId: projectId,
                title: `Notes for: ${taskTitle}`,
                blocks: [{
                    id: 'block_' + Date.now(),
                    type: 'paragraph',
                    content: ''
                }],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(noteId, JSON.stringify(note));
        }
        
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        mainContent.innerHTML = `
            <div class="view-header">
                <button class="btn-text" id="backToProjectBtn">
                    ← Back to ${projectName}
                </button>
                <div class="note-title-container">
                    <h2 style="margin: 0; color: var(--text-primary);">📝 ${taskTitle}</h2>
                </div>
                <button class="btn-text" id="deleteTaskNoteBtn">
                    🗑️ Delete Note
                </button>
            </div>

            <div class="editor-container">
                ${BlockEditor.renderEditor(noteId)}
            </div>
        `;
        
        // Setup event listeners after DOM is ready
        setTimeout(() => {
            const backBtn = document.getElementById('backToProjectBtn');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Task note back button clicked, navigating to project:', projectId);
                    window.location.hash = `#projects/${projectId}`;
                    setTimeout(() => {
                        if (window.App && typeof window.App.handleRoute === 'function') {
                            window.App.handleRoute();
                        }
                    }, 50);
                });
            }
            
            const deleteBtn = document.getElementById('deleteTaskNoteBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Delete this task note? This cannot be undone.')) {
                        this.deleteTaskNoteAndGoBack(projectId, taskId);
                    }
                });
            }
            
            // Initialize block editor with same params as project notes
            BlockEditor.init(noteId, projectId);
        }, 100);
    },
    
    deleteTaskNoteAndGoBack(projectId, taskId) {
        const noteId = `note_task_${taskId}`;
        localStorage.removeItem(noteId);
        console.log('Deleted task note:', noteId);
        window.location.hash = `#projects/${projectId}`;
        setTimeout(() => {
            if (window.App && typeof window.App.handleRoute === 'function') {
                window.App.handleRoute();
            }
        }, 50);
    },
    
    // ========================================
    // RESEARCH NOTES SECTION - Block Editor
    // ========================================
    
    renderNotesSection(projectId) {
        return `
            <div class="project-section">
                <div class="section-header">
                    <h2>📝 Research Notes</h2>
                    <button class="btn btn-primary btn-sm" onclick="ProjectsView.createNote('${projectId}')">
                        <span class="btn-icon">+</span>
                        New Note
                    </button>
                </div>
                
                <div class="notes-grid" id="notesGrid-${projectId}">
                    ${this.renderProjectNotes(projectId)}
                </div>
            </div>
        `;
    },
    
    renderProjectNotes(projectId) {
        const notes = this.getProjectNotes(projectId);
        
        if (notes.length === 0) {
            return `
                <div class="empty-state-small">
                    <div class="empty-icon">📝</div>
                    <p>No notes yet. Create your first note!</p>
                </div>
            `;
        }
        
        return notes.map(note => `
            <div class="note-card" onclick="ProjectsView.openNote('${projectId}', '${note.id}')">
                <div class="note-card-header">
                    <h3>${note.title || 'Untitled Note'}</h3>
                    <div class="note-card-actions" onclick="event.stopPropagation()">
                        <button class="btn-icon-sm" onclick="ProjectsView.renameNote('${projectId}', '${note.id}')" title="Rename">
                            ✏️
                        </button>
                        <button class="btn-icon-sm" onclick="ProjectsView.deleteNote('${projectId}', '${note.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="note-card-preview">
                    ${this.getNotePreview(note)}
                </div>
                <div class="note-card-footer">
                    <span class="note-card-date">${this.formatNoteDate(note.updatedAt || note.createdAt)}</span>
                    <span class="note-card-blocks">${note.blocks.length} block${note.blocks.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `).join('');
    },
    
    getProjectNotes(projectId) {
        const notes = [];
        const prefix = `note_project_${projectId}_`;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                try {
                    const note = JSON.parse(localStorage.getItem(key));
                    notes.push(note);
                } catch (e) {
                    console.error('Error parsing note:', key, e);
                }
            }
        }
        
        return notes.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
        });
    },
    
    getNotePreview(note) {
        if (!note.blocks || note.blocks.length === 0) {
            return '<span class="note-empty">Empty note</span>';
        }
        
        const firstBlocks = note.blocks.slice(0, 3);
        const preview = firstBlocks.map(block => {
            const content = block.content || '';
            const stripped = content.replace(/<[^>]*>/g, '').trim();
            if (!stripped) return '';
            const truncated = stripped.substring(0, 100);
            return `<div class="preview-block">${truncated}${stripped.length > 100 ? '...' : ''}</div>`;
        }).filter(p => p).join('');
        
        return preview || '<span class="note-empty">Empty note</span>';
    },
    
    formatNoteDate(dateStr) {
        if (!dateStr) return 'Just now';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    },
    
    createNote(projectId) {
        const noteId = `note_project_${projectId}_${Date.now()}`;
        const note = {
            id: noteId,
            projectId: projectId,
            title: 'Untitled Note',
            blocks: [{
                id: 'block_' + Date.now(),
                type: 'paragraph',
                content: ''
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(noteId, JSON.stringify(note));
        
        // Re-render notes grid to show new note
        const grid = document.getElementById(`notesGrid-${projectId}`);
        if (grid) {
            grid.innerHTML = this.renderProjectNotes(projectId);
        }
        
        UI.showToast('Note created', 'success');
    },
    
    openNote(projectId, noteId) {
        console.log('openNote called with:', projectId, noteId);
        // Navigate using hash to enable browser back button
        window.location.hash = `#projects/${projectId}/note/${noteId}`;
    },
    
    renderNoteEditor(projectId, noteId) {
        console.log('renderNoteEditor called with:', projectId, noteId);
        const project = DataStore.getProject(projectId);
        console.log('Found project:', project);
        
        if (!project) {
            UI.showToast('Project not found', 'error');
            window.location.hash = `#projects`;
            return;
        }
        
        const note = JSON.parse(localStorage.getItem(noteId));
        if (!note) {
            UI.showToast('Note not found', 'error');
            window.location.hash = `#projects/${projectId}`;
            return;
        }
        
        const mainContent = document.getElementById('mainContent');
        const projectName = project.name || 'Project';
        mainContent.innerHTML = `
            <div class="view-header">
                <button class="btn-text" id="backToProjectBtn">
                    ← Back to ${projectName}
                </button>
                <div class="note-title-container">
                    <input type="text" 
                           class="note-title-input" 
                           value="${(note.title || 'Untitled Note').replace(/"/g, '&quot;')}"
                           onchange="ProjectsView.updateNoteTitle('${noteId}', this.value)"
                           placeholder="Untitled Note">
                </div>
                <button class="btn-text" id="deleteNoteBtn">
                    🗑️ Delete
                </button>
            </div>

            <div class="editor-container">
                ${BlockEditor.renderEditor(noteId)}
            </div>
        `;

        // Setup event listeners
        setTimeout(() => {
            const backBtn = document.getElementById('backToProjectBtn');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Back button clicked, navigating to project:', projectId);
                    // Navigate using hash
                    window.location.hash = `#projects/${projectId}`;
                    // Force reload the route
                    setTimeout(() => {
                        if (window.App && typeof window.App.handleRoute === 'function') {
                            window.App.handleRoute();
                        }
                    }, 50);
                });
            }
            
            const deleteBtn = document.getElementById('deleteNoteBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deleteNoteAndGoBack(projectId, noteId);
                });
            }
            
            BlockEditor.init(noteId, projectId);
        }, 100);
    },
    
    updateNoteTitle(noteId, title) {
        const note = JSON.parse(localStorage.getItem(noteId));
        if (note) {
            note.title = title;
            note.updatedAt = new Date().toISOString();
            localStorage.setItem(noteId, JSON.stringify(note));
        }
    },
    
    renameNote(projectId, noteId) {
        const note = JSON.parse(localStorage.getItem(noteId));
        if (!note) return;

        const newTitle = prompt('Enter new title:', note.title || 'Untitled Note');
        if (newTitle && newTitle.trim()) {
            note.title = newTitle.trim();
            note.updatedAt = new Date().toISOString();
            localStorage.setItem(noteId, JSON.stringify(note));
            
            // Re-render notes grid
            const grid = document.getElementById(`notesGrid-${projectId}`);
            if (grid) {
                grid.innerHTML = this.renderProjectNotes(projectId);
            }
            
            UI.showToast('Note renamed', 'success');
        }
    },
    
    deleteNote(projectId, noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        localStorage.removeItem(noteId);
        UI.showToast('Note deleted', 'success');
        
        // Re-render notes grid
        const grid = document.getElementById(`notesGrid-${projectId}`);
        if (grid) {
            grid.innerHTML = this.renderProjectNotes(projectId);
        }
    },
    
    deleteNoteAndGoBack(projectId, noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        localStorage.removeItem(noteId);
        UI.showToast('Note deleted', 'success');
        
        // Go back to project detail
        window.location.hash = `#projects/${projectId}`;
    },
    
    toggleNotes(projectId) {
        // Deprecated - kept for compatibility
        // Notes are now always shown
    },
    
    // ========================================
    // TASK CRUD OPERATIONS
    // ========================================
    
    showAddTaskModal(projectId) {
        const modal = `
            <div class="modal active" id="taskModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Task</h3>
                        <button class="modal-close" onclick="ProjectsView.closeModal('taskModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Title *</label>
                            <input type="text" id="taskTitle" class="form-input" placeholder="e.g., Run baseline experiments">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="taskDescription" class="form-input" rows="3" placeholder="Detailed description..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Type</label>
                                <select id="taskType" class="form-input">
                                    <option value="research">Research</option>
                                    <option value="data">Data</option>
                                    <option value="implementation">Implementation</option>
                                    <option value="experiment">Experiment</option>
                                    <option value="writing">Writing</option>
                                    <option value="admin">Admin</option>
                                    <option value="meeting">Meeting</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Priority</label>
                                <select id="taskPriority" class="form-input">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Tag</label>
                            <input type="text" id="taskTag" class="form-input" placeholder="e.g., experiment, analysis, review">
                            <small style="color: var(--text-secondary);">Use @tag in notes to link to this task</small>
                        </div>
                        <div class="form-group">
                            <label>Due Date</label>
                            <input type="date" id="taskDueDate" class="form-input">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ProjectsView.closeModal('taskModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="ProjectsView.addTask('${projectId}')">Add Task</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    addTask(projectId) {
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const taskData = {
            projectId: projectId,
            title: title,
            description: document.getElementById('taskDescription').value.trim(),
            type: document.getElementById('taskType').value,
            priority: document.getElementById('taskPriority').value,
            status: 'todo',
            tag: document.getElementById('taskTag').value.trim() || null,
            dueDate: document.getElementById('taskDueDate').value || null,
            notes: ''
        };
        
        DataStore.createTask(taskData);
        this.closeModal('taskModal');
        
        // Re-render the project detail view to show the new task
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = this.renderDetail(projectId);
            this.init(); // Re-initialize event listeners
        }
        
        UI.showToast('Task added successfully!', 'success');
    },
    
    editTaskInline(taskId, field, cell) {
        const task = DataStore.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        const currentValue = task[field] || '';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'inline-edit-input';
        input.style.width = '100%';
        input.style.padding = '0.25rem';
        input.style.border = '1px solid var(--primary)';
        input.style.borderRadius = '3px';
        
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();
        
        const saveValue = () => {
            const newValue = input.value.trim();
            DataStore.updateTask(taskId, { [field]: newValue });
            
            // Re-render the row
            const row = cell.closest('tr');
            const updatedTask = DataStore.getTasks().find(t => t.id === taskId);
            if (row && updatedTask) {
                row.outerHTML = this.renderTaskRow(updatedTask);
            }
            
            UI.showToast('Task updated', 'success');
        };
        
        input.addEventListener('blur', saveValue);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                // Re-render without saving
                const row = cell.closest('tr');
                if (row) {
                    row.outerHTML = this.renderTaskRow(task);
                }
            }
        });
    },
    
    updateTaskField(taskId, field, value) {
        DataStore.updateTask(taskId, { [field]: value });
        
        // Update the select element's class to reflect the new value
        const select = event.target;
        if (field === 'status') {
            select.className = `inline-select task-status-select task-status-${value}`;
        } else if (field === 'type') {
            select.className = `inline-select task-type-select task-type-${value}`;
        }
        
        UI.showToast('Task updated', 'success');
    },
    
    filterTasksByType(projectId, type) {
        const rows = document.querySelectorAll('[data-task-id]');
        const tasks = DataStore.getTasks().filter(t => t.projectId === projectId);
        
        rows.forEach(row => {
            const taskId = row.getAttribute('data-task-id');
            const task = tasks.find(t => t.id === taskId);
            
            if (!task) return;
            
            if (type === '' || task.type === type) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },
    
    filterTasksByStatus(projectId, status) {
        const rows = document.querySelectorAll('[data-task-id]');
        const tasks = DataStore.getTasks().filter(t => t.projectId === projectId);
        
        rows.forEach(row => {
            const taskId = row.getAttribute('data-task-id');
            const task = tasks.find(t => t.id === taskId);
            
            if (!task) return;
            
            if (status === '' || task.status === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },
    
    filterPapersByStatus(projectId, status) {
        const rows = document.querySelectorAll('[data-paper-id]');
        const papers = DataStore.getPapers().filter(p => p.projectId === projectId);
        
        rows.forEach(row => {
            const paperId = row.getAttribute('data-paper-id');
            const paper = papers.find(p => p.id === paperId);
            
            if (!paper) return;
            
            if (status === '' || paper.status === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },
    
    filterPapersByImportance(projectId, importance) {
        const rows = document.querySelectorAll('[data-paper-id]');
        const papers = DataStore.getPapers().filter(p => p.projectId === projectId);
        
        rows.forEach(row => {
            const paperId = row.getAttribute('data-paper-id');
            const paper = papers.find(p => p.id === paperId);
            
            if (!paper) return;
            
            if (importance === '' || paper.importance === importance) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },
    
    openPaperNote(projectId, paperId, paperTitle) {
        console.log('openPaperNote called with:', projectId, paperId, paperTitle);
        window.location.hash = `#projects/${projectId}/paper-note/${paperId}`;
    },
    
    renderPaperNoteEditor(projectId, paperId, paperTitle) {
        console.log('renderPaperNoteEditor called with:', projectId, paperId, paperTitle);
        const project = DataStore.getProject(projectId);
        console.log('Found project:', project);
        
        if (!project) {
            UI.showToast('Project not found', 'error');
            window.location.hash = `#projects`;
            return;
        }
        
        const paper = DataStore.getPaper(paperId);
        if (!paper) {
            UI.showToast('Paper not found', 'error');
            window.location.hash = `#projects/${projectId}`;
            return;
        }
        
        const noteId = `note_paper_${paperId}`;
        
        const mainContent = document.getElementById('mainContent');
        const projectName = project.name || 'Project';
        mainContent.innerHTML = `
            <div class="view-header">
                <button class="btn-text" id="backToProjectBtn">
                    ← Back to ${projectName}
                </button>
                <h2>📝 Notes: ${paper.title || paperTitle || 'Paper'}</h2>
            </div>

            <div class="editor-container">
                ${BlockEditor.renderEditor(noteId, projectId)}
            </div>
        `;

        setTimeout(() => {
            const backBtn = document.getElementById('backToProjectBtn');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.hash = `#projects/${projectId}`;
                });
            }
            
            BlockEditor.init(noteId, projectId);
        }, 100);
    },
    
    viewPaperPdf(paperId) {
        const paper = DataStore.getPaper(paperId);
        if (!paper || !paper.pdfData) {
            UI.showToast('PDF not available', 'error');
            return;
        }
        
        // Open PDF in new window
        const pdfWindow = window.open('', '_blank');
        pdfWindow.document.write(`
            <html>
                <head>
                    <title>${paper.title}</title>
                    <style>
                        body { margin: 0; }
                        iframe { border: none; width: 100vw; height: 100vh; }
                    </style>
                </head>
                <body>
                    <iframe src="${paper.pdfData}" type="application/pdf"></iframe>
                </body>
            </html>
        `);
    },
    
    showEditTaskModal(taskId) {
        const task = DataStore.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        const modal = `
            <div class="modal active" id="editTaskModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Task</h3>
                        <button class="modal-close" onclick="ProjectsView.closeModal('editTaskModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Title *</label>
                            <input type="text" id="editTaskTitle" class="form-input" value="${task.title}">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="editTaskDescription" class="form-input" rows="3">${task.description || ''}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Type</label>
                                <select id="editTaskType" class="form-input">
                                    <option value="research" ${task.type === 'research' ? 'selected' : ''}>Research</option>
                                    <option value="data" ${task.type === 'data' ? 'selected' : ''}>Data</option>
                                    <option value="implementation" ${task.type === 'implementation' ? 'selected' : ''}>Implementation</option>
                                    <option value="experiment" ${task.type === 'experiment' ? 'selected' : ''}>Experiment</option>
                                    <option value="writing" ${task.type === 'writing' ? 'selected' : ''}>Writing</option>
                                    <option value="admin" ${task.type === 'admin' ? 'selected' : ''}>Admin</option>
                                    <option value="meeting" ${task.type === 'meeting' ? 'selected' : ''}>Meeting</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Priority</label>
                                <select id="editTaskPriority" class="form-input">
                                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Due Date</label>
                            <input type="date" id="editTaskDueDate" class="form-input" value="${task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ProjectsView.closeModal('editTaskModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="ProjectsView.saveTaskEdits('${taskId}')">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    saveTaskEdits(taskId) {
        const title = document.getElementById('editTaskTitle').value.trim();
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const updates = {
            title: title,
            description: document.getElementById('editTaskDescription').value.trim(),
            type: document.getElementById('editTaskType').value,
            priority: document.getElementById('editTaskPriority').value,
            dueDate: document.getElementById('editTaskDueDate').value || null
        };
        
        DataStore.updateTask(taskId, updates);
        this.closeModal('editTaskModal');
        
        // Refresh the current project view
        const task = DataStore.getTasks().find(t => t.id === taskId);
        App.navigate(`projects/${task.projectId}`);
        UI.showToast('Task updated successfully!', 'success');
    },
    
    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        const task = DataStore.getTasks().find(t => t.id === taskId);
        const projectId = task.projectId;
        
        DataStore.deleteTask(taskId);
        App.navigate(`projects/${projectId}`);
        UI.showToast('Task deleted', 'success');
    },
    
    // ========================================
    // TASK NOTES MODAL - Rich Text Editor
    // ========================================
    
    showTaskNotesModal(taskId) {
        const task = DataStore.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        const modal = `
            <div class="modal active" id="taskNotesModal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>📝 Task Notes: ${task.title}</h3>
                        <button class="modal-close" onclick="ProjectsView.closeModal('taskNotesModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="rich-text-editor">
                            <div class="editor-toolbar">
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('bold')" title="Bold (Ctrl+B)">
                                    <strong>B</strong>
                                </button>
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('italic')" title="Italic (Ctrl+I)">
                                    <em>I</em>
                                </button>
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('underline')" title="Underline (Ctrl+U)">
                                    <u>U</u>
                                </button>
                                <div class="toolbar-separator"></div>
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('insertUnorderedList')" title="Bullet List">
                                    • List
                                </button>
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('insertOrderedList')" title="Numbered List">
                                    1. List
                                </button>
                                <div class="toolbar-separator"></div>
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('formatBlock', 'h3')" title="Heading 3">
                                    H3
                                </button>
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('formatBlock', 'p')" title="Paragraph">
                                    P
                                </button>
                                <div class="toolbar-separator"></div>
                                <select class="editor-select" onchange="ProjectsView.changeTextColor(this.value); this.value=''">
                                    <option value="">Text Color</option>
                                    <option value="#000000">Black</option>
                                    <option value="#ef4444">Red</option>
                                    <option value="#10b981">Green</option>
                                    <option value="#2563eb">Blue</option>
                                    <option value="#f59e0b">Orange</option>
                                    <option value="#8b5cf6">Purple</option>
                                </select>
                                <select class="editor-select" onchange="ProjectsView.changeBackgroundColor(this.value); this.value=''">
                                    <option value="">Highlight</option>
                                    <option value="#fef3c7">Yellow</option>
                                    <option value="#dbeafe">Blue</option>
                                    <option value="#d1fae5">Green</option>
                                    <option value="#fce7f3">Pink</option>
                                    <option value="transparent">Clear</option>
                                </select>
                                <div class="toolbar-separator"></div>
                                <button type="button" class="editor-btn" onclick="ProjectsView.formatText('removeFormat')" title="Clear Formatting">
                                    Clear
                                </button>
                            </div>
                            <div 
                                id="taskNotesEditor" 
                                class="editor-content" 
                                contenteditable="true"
                                spellcheck="true"
                            >${task.notes || '<p>Start writing your notes here... Supports English and Vietnamese.</p>'}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ProjectsView.closeModal('taskNotesModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="ProjectsView.saveTaskNotes('${taskId}')">Save Notes</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
        
        // Focus editor
        setTimeout(() => {
            const editor = document.getElementById('taskNotesEditor');
            if (editor) editor.focus();
        }, 100);
    },
    
    formatText(command, value = null) {
        document.execCommand(command, false, value);
        document.getElementById('taskNotesEditor').focus();
    },
    
    changeTextColor(color) {
        document.execCommand('foreColor', false, color);
        document.getElementById('taskNotesEditor').focus();
    },
    
    changeBackgroundColor(color) {
        document.execCommand('backColor', false, color);
        document.getElementById('taskNotesEditor').focus();
    },
    
    saveTaskNotes(taskId) {
        const editor = document.getElementById('taskNotesEditor');
        if (!editor) return;
        
        const notes = editor.innerHTML;
        DataStore.updateTask(taskId, { notes: notes });
        
        this.closeModal('taskNotesModal');
        
        // Refresh the current project view
        const task = DataStore.getTasks().find(t => t.id === taskId);
        App.navigate(`projects/${task.projectId}`);
        UI.showToast('Notes saved successfully!', 'success');
    },
    
    // ========================================
    // PAPER CRUD OPERATIONS
    // ========================================
    
    showAddPaperModal(projectId) {
        const modal = `
            <div class="modal active" id="paperModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Paper</h3>
                        <button class="modal-close" onclick="ProjectsView.closeModal('paperModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Title *</label>
                            <input type="text" id="paperTitle" class="form-input" placeholder="e.g., Attention Is All You Need">
                        </div>
                        <div class="form-group">
                            <label>Authors</label>
                            <input type="text" id="paperAuthors" class="form-input" placeholder="e.g., Vaswani, A., et al.">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Journal/Venue</label>
                                <input type="text" id="paperJournal" class="form-input" placeholder="e.g., NeurIPS 2017">
                            </div>
                            <div class="form-group">
                                <label>Year</label>
                                <input type="number" id="paperYear" class="form-input" value="${new Date().getFullYear()}" min="1900" max="2100">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Status</label>
                                <select id="paperStatus" class="form-input">
                                    <option value="to-read" selected>To Read</option>
                                    <option value="reading">Reading</option>
                                    <option value="read">Read</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Importance</label>
                                <select id="paperImportance" class="form-input">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Upload PDF (optional)</label>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <input type="file" id="paperPdfFile" accept=".pdf" class="form-input" style="flex: 1;">
                                <span id="pdfUploadStatus" class="text-sm text-secondary"></span>
                            </div>
                            <small class="text-secondary">Upload a PDF file to view directly in the app</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ProjectsView.closeModal('paperModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="ProjectsView.addPaper('${projectId}')">Add Paper</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    addPaper(projectId) {
        const title = document.getElementById('paperTitle').value.trim();
        if (!title) {
            alert('Please enter a paper title');
            return;
        }
        
        const pdfFile = document.getElementById('paperPdfFile').files[0];
        
        const paperData = {
            projectId: projectId,
            title: title,
            authors: document.getElementById('paperAuthors').value.trim(),
            journal: document.getElementById('paperJournal').value.trim(),
            year: parseInt(document.getElementById('paperYear').value),
            status: document.getElementById('paperStatus').value,
            importance: document.getElementById('paperImportance').value
        };
        
        // Handle PDF upload if file selected
        if (pdfFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const pdfData = e.target.result;
                // Create paper first
                const newPaper = DataStore.createPaper(paperData);
                // Save PDF to IndexedDB
                await PDFStorage.savePDF(newPaper.id, pdfData, pdfFile.name);
                // Update paper with hasPDF flag
                DataStore.updatePaper(newPaper.id, { hasPDF: true, pdfFileName: pdfFile.name });
                
                this.closeModal('paperModal');
                // Refresh the project detail view
                const mainContent = document.getElementById('mainContent');
                mainContent.innerHTML = this.renderDetail(projectId);
                this.init();
                UI.showToast('Paper added with PDF permanently saved!', 'success');
            };
            reader.onerror = () => {
                alert('Error reading PDF file');
            };
            reader.readAsDataURL(pdfFile);
        } else {
            DataStore.createPaper(paperData);
            this.closeModal('paperModal');
            // Refresh the project detail view
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = this.renderDetail(projectId);
            this.init();
            UI.showToast('Paper added successfully!', 'success');
        }
    },
    
    updatePaperField(paperId, field, value) {
        DataStore.updatePaper(paperId, { [field]: value });
        UI.showToast('Paper updated', 'success');
    },
    
    showEditPaperModal(paperId) {
        const paper = DataStore.getPaper(paperId);
        if (!paper) return;
        
        const modal = `
            <div class="modal active" id="editPaperModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Paper</h3>
                        <button class="modal-close" onclick="ProjectsView.closeModal('editPaperModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Title *</label>
                            <input type="text" id="editPaperTitle" class="form-input" value="${paper.title}">
                        </div>
                        <div class="form-group">
                            <label>Authors</label>
                            <input type="text" id="editPaperAuthors" class="form-input" value="${paper.authors || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Journal/Venue</label>
                                <input type="text" id="editPaperJournal" class="form-input" value="${paper.journal || ''}">
                            </div>
                            <div class="form-group">
                                <label>Year</label>
                                <input type="number" id="editPaperYear" class="form-input" value="${paper.year}" min="1900" max="2100">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Status</label>
                                <select id="editPaperStatus" class="form-input">
                                    <option value="to-read" ${paper.status === 'to-read' ? 'selected' : ''}>To Read</option>
                                    <option value="reading" ${paper.status === 'reading' ? 'selected' : ''}>Reading</option>
                                    <option value="read" ${paper.status === 'read' ? 'selected' : ''}>Read</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Importance</label>
                                <select id="editPaperImportance" class="form-input">
                                    <option value="low" ${paper.importance === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${paper.importance === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${paper.importance === 'high' ? 'selected' : ''}>High</option>
                                    <option value="critical" ${paper.importance === 'critical' ? 'selected' : ''}>Critical</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>PDF Path</label>
                            <input type="text" id="editPaperPdfPath" class="form-input" value="${paper.pdfPath || ''}">
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <textarea id="editPaperNotes" class="form-input" rows="3">${paper.notes || ''}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ProjectsView.closeModal('editPaperModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="ProjectsView.savePaperEdits('${paperId}')">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    savePaperEdits(paperId) {
        const title = document.getElementById('editPaperTitle').value.trim();
        if (!title) {
            alert('Please enter a paper title');
            return;
        }
        
        const updates = {
            title: title,
            authors: document.getElementById('editPaperAuthors').value.trim(),
            journal: document.getElementById('editPaperJournal').value.trim(),
            year: parseInt(document.getElementById('editPaperYear').value),
            status: document.getElementById('editPaperStatus').value,
            importance: document.getElementById('editPaperImportance').value,
            pdfPath: document.getElementById('editPaperPdfPath').value.trim(),
            notes: document.getElementById('editPaperNotes').value.trim()
        };
        
        DataStore.updatePaper(paperId, updates);
        this.closeModal('editPaperModal');
        
        const paper = DataStore.getPaper(paperId);
        App.navigate(`projects/${paper.projectId}`);
        UI.showToast('Paper updated successfully!', 'success');
    },
    
    deletePaper(paperId) {
        if (!confirm('Are you sure you want to delete this paper and all its annotations?')) return;
        
        const paper = DataStore.getPaper(paperId);
        const projectId = paper.projectId;
        
        DataStore.deletePaper(paperId);
        App.navigate(`projects/${projectId}`);
        UI.showToast('Paper deleted', 'success');
    },
    
    // ========================================
    // HELPER METHODS
    // ========================================
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    },
    
    sort(key) {
        if (this.currentSort.key === key) {
            this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = { key, order: 'asc' };
        }
        this.renderTable();
    },
    
    setFilter(value) {
        this.currentFilter = value;
        this.renderTable();
    },
    
    filterProjects(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.renderTable();
    },
    
    getFilteredProjects() {
        let projects = DataStore.getProjects();
        
        // Apply stage filter
        if (this.currentFilter !== 'all') {
            projects = projects.filter(p => p.stage === this.currentFilter);
        }
        
        // Apply search
        if (this.searchTerm) {
            projects = projects.filter(p => 
                p.title.toLowerCase().includes(this.searchTerm) ||
                (p.description && p.description.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Apply sort
        projects = [...projects].sort((a, b) => {
            let aVal = a[this.currentSort.key];
            let bVal = b[this.currentSort.key];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return this.currentSort.order === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.order === 'asc' ? 1 : -1;
            return 0;
        });
        
        return projects;
    },
    
    init() {
        this.searchTerm = '';
        this.renderTable();
    }
};
