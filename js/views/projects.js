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
                ${this.renderWhiteboardsSection(project.id, whiteboards)}
                ${this.renderNotesSection(project.id)}
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
                                <th style="width: 30%">Title</th>
                                <th style="width: 12%">Type</th>
                                <th style="width: 12%">Status</th>
                                <th style="width: 12%">Due Date</th>
                                <th style="width: 20%">Notes</th>
                                <th style="width: 14%">Actions</th>
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
        const notesPreview = task.notes 
            ? task.notes.replace(/<[^>]*>/g, '').substring(0, 50) + (task.notes.length > 50 ? '...' : '')
            : 'No notes';
        
        return `
            <tr data-task-id="${task.id}">
                <td class="editable-cell" onclick="ProjectsView.editTaskInline('${task.id}', 'title', this)">
                    <strong>${task.title}</strong>
                </td>
                <td>
                    <select class="inline-select" onchange="ProjectsView.updateTaskField('${task.id}', 'type', this.value)">
                        <option value="research" ${task.type === 'research' ? 'selected' : ''}>Research</option>
                        <option value="data" ${task.type === 'data' ? 'selected' : ''}>Data</option>
                        <option value="implementation" ${task.type === 'implementation' ? 'selected' : ''}>Implementation</option>
                        <option value="experiment" ${task.type === 'experiment' ? 'selected' : ''}>Experiment</option>
                        <option value="writing" ${task.type === 'writing' ? 'selected' : ''}>Writing</option>
                        <option value="admin" ${task.type === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="meeting" ${task.type === 'meeting' ? 'selected' : ''}>Meeting</option>
                    </select>
                </td>
                <td>
                    <select class="inline-select" onchange="ProjectsView.updateTaskField('${task.id}', 'status', this.value)">
                        <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Todo</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                </td>
                <td class="editable-cell" onclick="ProjectsView.editTaskInline('${task.id}', 'dueDate', this)">
                    ${task.dueDate ? UI.formatDate(task.dueDate) : 'No date'}
                </td>
                <td class="notes-preview-cell">
                    <button class="btn-notes" onclick="ProjectsView.showTaskNotesModal('${task.id}')" title="View/Edit Notes">
                        <span class="notes-icon">📝</span>
                        <span class="notes-text">${notesPreview}</span>
                    </button>
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
                                <th style="width: 35%">Title</th>
                                <th style="width: 15%">Journal/Venue</th>
                                <th style="width: 10%">Year</th>
                                <th style="width: 12%">Status</th>
                                <th style="width: 13%">Importance</th>
                                <th style="width: 15%">Actions</th>
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
        return `
            <tr data-paper-id="${paper.id}" onclick="App.navigate('papers/${paper.id}')" style="cursor: pointer;">
                <td>
                    <strong>${paper.title}</strong>
                    ${paper.keyTakeaways && paper.keyTakeaways.length > 0 ? '<span class="badge-mini">💡</span>' : ''}
                </td>
                <td class="text-sm">${paper.journal}</td>
                <td class="text-sm">${paper.year}</td>
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
    // RESEARCH NOTES SECTION - Block Editor
    // ========================================
    
    renderNotesSection(projectId) {
        const noteId = `note_project_${projectId}`;
        
        return `
            <div class="project-section">
                <div class="section-header">
                    <h2>📝 Research Notes</h2>
                    <button class="btn btn-secondary btn-sm" onclick="ProjectsView.toggleNotes('${projectId}')">
                        <span id="notesToggleText-${projectId}">Show Notes</span>
                    </button>
                </div>
                
                <div id="notesContainer-${projectId}" style="display: none;">
                    ${BlockEditor.renderEditor(noteId, projectId)}
                </div>
            </div>
        `;
    },
    
    toggleNotes(projectId) {
        const container = document.getElementById(`notesContainer-${projectId}`);
        const toggleText = document.getElementById(`notesToggleText-${projectId}`);
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            toggleText.textContent = 'Hide Notes';
            
            // Initialize editor when shown
            const noteId = `note_project_${projectId}`;
            setTimeout(() => {
                BlockEditor.init(noteId);
                console.log('✅ BlockEditor initialized for:', noteId);
            }, 100);
        } else {
            container.style.display = 'none';
            toggleText.textContent = 'Show Notes';
            BlockEditor.destroy();
        }
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
            dueDate: document.getElementById('taskDueDate').value || null,
            notes: ''
        };
        
        DataStore.createTask(taskData);
        this.closeModal('taskModal');
        
        // Refresh the page
        App.navigate(`projects/${projectId}`);
        UI.showToast('Task added successfully!', 'success');
    },
    
    updateTaskField(taskId, field, value) {
        DataStore.updateTask(taskId, { [field]: value });
        UI.showToast('Task updated', 'success');
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
                            <label>PDF Path (optional)</label>
                            <input type="text" id="paperPdfPath" class="form-input" placeholder="assets/pdf/your-paper.pdf">
                            <small class="text-secondary">Place PDF file in assets/pdf/ folder first</small>
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <textarea id="paperNotes" class="form-input" rows="3" placeholder="Why is this paper important for your research?"></textarea>
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
        
        const paperData = {
            projectId: projectId,
            title: title,
            authors: document.getElementById('paperAuthors').value.trim(),
            journal: document.getElementById('paperJournal').value.trim(),
            year: parseInt(document.getElementById('paperYear').value),
            status: document.getElementById('paperStatus').value,
            importance: document.getElementById('paperImportance').value,
            pdfPath: document.getElementById('paperPdfPath').value.trim(),
            notes: document.getElementById('paperNotes').value.trim()
        };
        
        DataStore.createPaper(paperData);
        this.closeModal('paperModal');
        
        App.navigate(`projects/${projectId}`);
        UI.showToast('Paper added successfully!', 'success');
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
