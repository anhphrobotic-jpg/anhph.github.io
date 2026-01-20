// ===================================
// Project Detail Page Module
// ===================================

const ProjectDetail = {
    currentProject: null,
    currentTab: 'overview',
    currentEditingItem: null,

    // Canvas properties
    canvas: null,
    ctx: null,
    isDrawing: false,
    currentTool: 'pen',
    currentColor: '#000000',
    brushSize: 2,

    // ===================================
    // Initialization
    // ===================================

    init() {
        this.loadProject();
        this.bindEvents();
        this.initCanvas();
        this.registerShortcuts();
    },

    loadProject() {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) {
            UI.showToast('Project not found', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        const project = Storage.getProject(projectId);
        
        if (!project) {
            UI.showToast('Project not found', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        this.currentProject = project;
        this.renderProjectInfo();
        this.renderOverview();
        this.renderTasks();
        this.renderNotes();
        this.renderReferences();
        this.loadWhiteboard();
    },

    bindEvents() {
        // Tab navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Project actions
        const editProjectBtn = document.getElementById('editProjectBtn');
        const deleteProjectBtn = document.getElementById('deleteProjectBtn');

        if (editProjectBtn) {
            editProjectBtn.addEventListener('click', () => this.editProject());
        }
        if (deleteProjectBtn) {
            deleteProjectBtn.addEventListener('click', () => this.deleteProject());
        }

        // Overview
        const editOverviewBtn = document.getElementById('editOverviewBtn');
        const closeOverviewModal = document.getElementById('closeOverviewModal');
        const cancelOverview = document.getElementById('cancelOverview');
        const overviewForm = document.getElementById('overviewForm');

        if (editOverviewBtn) {
            editOverviewBtn.addEventListener('click', () => this.openOverviewModal());
        }
        if (closeOverviewModal) {
            closeOverviewModal.addEventListener('click', () => UI.closeModal('overviewModal'));
        }
        if (cancelOverview) {
            cancelOverview.addEventListener('click', () => UI.closeModal('overviewModal'));
        }
        if (overviewForm) {
            overviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveOverview();
            });
        }

        // Tasks
        const addTaskBtn = document.getElementById('addTaskBtn');
        const closeTaskModal = document.getElementById('closeTaskModal');
        const cancelTask = document.getElementById('cancelTask');
        const taskForm = document.getElementById('taskForm');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.openTaskModal());
        }
        if (closeTaskModal) {
            closeTaskModal.addEventListener('click', () => UI.closeModal('taskModal'));
        }
        if (cancelTask) {
            cancelTask.addEventListener('click', () => UI.closeModal('taskModal'));
        }
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTask();
            });
        }

        // Notes
        const addNoteBtn = document.getElementById('addNoteBtn');
        const closeNoteModal = document.getElementById('closeNoteModal');
        const cancelNote = document.getElementById('cancelNote');
        const noteForm = document.getElementById('noteForm');

        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => this.openNoteModal());
        }
        if (closeNoteModal) {
            closeNoteModal.addEventListener('click', () => UI.closeModal('noteModal'));
        }
        if (cancelNote) {
            cancelNote.addEventListener('click', () => UI.closeModal('noteModal'));
        }
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNote();
            });
        }

        // References
        const addReferenceBtn = document.getElementById('addReferenceBtn');
        const closeRefModal = document.getElementById('closeRefModal');
        const cancelRef = document.getElementById('cancelRef');
        const referenceForm = document.getElementById('referenceForm');

        if (addReferenceBtn) {
            addReferenceBtn.addEventListener('click', () => this.openReferenceModal());
        }
        if (closeRefModal) {
            closeRefModal.addEventListener('click', () => UI.closeModal('referenceModal'));
        }
        if (cancelRef) {
            cancelRef.addEventListener('click', () => UI.closeModal('referenceModal'));
        }
        if (referenceForm) {
            referenceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveReference();
            });
        }

        // Whiteboard
        const saveCanvasBtn = document.getElementById('saveCanvas');
        const clearCanvasBtn = document.getElementById('clearCanvas');

        if (saveCanvasBtn) {
            saveCanvasBtn.addEventListener('click', () => this.saveWhiteboard());
        }
        if (clearCanvasBtn) {
            clearCanvasBtn.addEventListener('click', () => this.clearCanvas());
        }
    },

    registerShortcuts() {
        // Ctrl+S: Save (context-aware)
        UI.registerShortcut('ctrl+s', () => {
            if (this.currentTab === 'whiteboard') {
                this.saveWhiteboard();
            }
        });

        // Ctrl+N: Add new item (context-aware)
        UI.registerShortcut('ctrl+n', () => {
            switch (this.currentTab) {
                case 'tasks':
                    this.openTaskModal();
                    break;
                case 'notes':
                    this.openNoteModal();
                    break;
                case 'references':
                    this.openReferenceModal();
                    break;
            }
        });
    },

    // ===================================
    // Render Functions
    // ===================================

    renderProjectInfo() {
        const project = this.currentProject;

        // Title
        const titleEl = document.getElementById('projectTitle');
        if (titleEl) titleEl.textContent = project.title;

        // Status
        const statusEl = document.getElementById('projectStatus');
        if (statusEl) {
            statusEl.textContent = this.formatStatus(project.status);
            statusEl.className = `status-badge ${project.status}`;
        }

        // Progress
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        if (progressBar) progressBar.style.width = `${project.progress}%`;
        if (progressText) progressText.textContent = `${project.progress}%`;

        // Created date
        const createdDate = document.getElementById('createdDate');
        if (createdDate) createdDate.textContent = UI.formatDate(project.createdAt);

        // Update badges
        this.updateBadges();
    },

    updateBadges() {
        const project = this.currentProject;
        
        const tasksBadge = document.getElementById('tasksBadge');
        const notesBadge = document.getElementById('notesBadge');
        const refsBadge = document.getElementById('refsBadge');

        const completedTasks = project.tasks.filter(t => t.status === 'done').length;
        
        if (tasksBadge) tasksBadge.textContent = `${completedTasks}/${project.tasks.length}`;
        if (notesBadge) notesBadge.textContent = project.notes.length;
        if (refsBadge) refsBadge.textContent = project.references.length;
    },

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.getElementById(`${tabName}Tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    },

    // ===================================
    // Overview Section
    // ===================================

    renderOverview() {
        const overview = this.currentProject.overview;

        this.updateOverviewContent('goalsContent', overview.goals);
        this.updateOverviewContent('questionsContent', overview.questions);
        this.updateOverviewContent('hypothesisContent', overview.hypothesis);
        this.updateOverviewContent('statusContent', overview.currentStatus);
    },

    updateOverviewContent(elementId, content) {
        const el = document.getElementById(elementId);
        if (!el) return;

        if (content && content.trim()) {
            el.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
        } else {
            el.innerHTML = '<p class="text-muted">Click Edit to add content...</p>';
        }
    },

    openOverviewModal() {
        const overview = this.currentProject.overview;

        document.getElementById('goalsInput').value = overview.goals || '';
        document.getElementById('questionsInput').value = overview.questions || '';
        document.getElementById('hypothesisInput').value = overview.hypothesis || '';
        document.getElementById('statusInput').value = overview.currentStatus || '';

        UI.openModal('overviewModal');
    },

    saveOverview() {
        const overview = {
            goals: document.getElementById('goalsInput').value.trim(),
            questions: document.getElementById('questionsInput').value.trim(),
            hypothesis: document.getElementById('hypothesisInput').value.trim(),
            currentStatus: document.getElementById('statusInput').value.trim()
        };

        Storage.updateOverview(this.currentProject.id, overview);
        this.currentProject.overview = overview;

        this.renderOverview();
        UI.closeModal('overviewModal');
        UI.showToast('Overview updated!', 'success');
    },

    // ===================================
    // Tasks Section
    // ===================================

    renderTasks() {
        const tasks = this.currentProject.tasks;
        const container = document.getElementById('tasksList');
        const emptyState = document.getElementById('tasksEmpty');

        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = tasks.map(task => this.createTaskItem(task)).join('');

        // Bind task events
        this.bindTaskEvents();
    },

    createTaskItem(task) {
        const checked = task.status === 'done' ? 'checked' : '';
        const doneClass = task.status === 'done' ? 'done' : '';

        return `
            <div class="task-item ${doneClass}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${checked}>
                <div class="task-content">
                    <span class="task-title">${this.escapeHtml(task.title)}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-sm btn-task-edit" title="Edit">✏️</button>
                    <button class="btn-icon btn-sm btn-task-delete" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    },

    bindTaskEvents() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            const taskId = item.dataset.id;
            const checkbox = item.querySelector('.task-checkbox');
            const editBtn = item.querySelector('.btn-task-edit');
            const deleteBtn = item.querySelector('.btn-task-delete');

            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const newStatus = e.target.checked ? 'done' : 'todo';
                    this.updateTaskStatus(taskId, newStatus);
                });
            }

            if (editBtn) {
                editBtn.addEventListener('click', () => this.openTaskModal(taskId));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteTask(taskId));
            }
        });
    },

    openTaskModal(taskId = null) {
        if (taskId) {
            const task = this.currentProject.tasks.find(t => t.id === taskId);
            if (!task) return;

            this.currentEditingItem = task;
            document.getElementById('taskModalTitle').textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskStatus').value = task.status;
        } else {
            this.currentEditingItem = null;
            document.getElementById('taskModalTitle').textContent = 'Add Task';
            UI.resetForm('taskForm');
        }

        UI.openModal('taskModal');
        document.getElementById('taskTitle').focus();
    },

    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const status = document.getElementById('taskStatus').value;

        if (!title) {
            UI.showToast('Please enter a task title', 'error');
            return;
        }

        if (this.currentEditingItem) {
            // Update existing task
            const updated = Storage.updateTask(this.currentProject.id, this.currentEditingItem.id, {
                title,
                status
            });
            
            if (updated) {
                this.currentProject = updated;
                UI.showToast('Task updated!', 'success');
            }
        } else {
            // Create new task
            const updated = Storage.addTask(this.currentProject.id, { title, status });
            
            if (updated) {
                this.currentProject = updated;
                UI.showToast('Task added!', 'success');
            }
        }

        this.renderTasks();
        this.renderProjectInfo();
        UI.closeModal('taskModal');
    },

    updateTaskStatus(taskId, newStatus) {
        const updated = Storage.updateTask(this.currentProject.id, taskId, { status: newStatus });
        
        if (updated) {
            this.currentProject = updated;
            this.renderTasks();
            this.renderProjectInfo();
        }
    },

    deleteTask(taskId) {
        UI.confirm('Delete this task?', () => {
            const updated = Storage.deleteTask(this.currentProject.id, taskId);
            
            if (updated) {
                this.currentProject = updated;
                this.renderTasks();
                this.renderProjectInfo();
                UI.showToast('Task deleted', 'success');
            }
        });
    },

    // ===================================
    // Notes Section
    // ===================================

    renderNotes() {
        const notes = this.currentProject.notes;
        const container = document.getElementById('notesList');
        const emptyState = document.getElementById('notesEmpty');

        if (!container) return;

        if (notes.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = notes
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map(note => this.createNoteCard(note))
            .join('');

        this.bindNoteEvents();
    },

    createNoteCard(note) {
        const preview = note.content.substring(0, 200);
        
        return `
            <div class="note-card" data-id="${note.id}">
                <div class="note-header">
                    <h4 class="note-title">${this.escapeHtml(note.title)}</h4>
                    <div class="note-actions">
                        <button class="btn-icon btn-sm btn-note-edit" title="Edit">✏️</button>
                        <button class="btn-icon btn-sm btn-note-delete" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="note-content">${this.escapeHtml(preview)}${note.content.length > 200 ? '...' : ''}</div>
                <div class="note-date">${UI.formatDateTime(note.updatedAt)}</div>
            </div>
        `;
    },

    bindNoteEvents() {
        const noteCards = document.querySelectorAll('.note-card');
        
        noteCards.forEach(card => {
            const noteId = card.dataset.id;
            const editBtn = card.querySelector('.btn-note-edit');
            const deleteBtn = card.querySelector('.btn-note-delete');

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-icon')) {
                    this.viewNote(noteId);
                }
            });

            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openNoteModal(noteId);
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteNote(noteId);
                });
            }
        });
    },

    openNoteModal(noteId = null) {
        if (noteId) {
            const note = this.currentProject.notes.find(n => n.id === noteId);
            if (!note) return;

            this.currentEditingItem = note;
            document.getElementById('noteModalTitle').textContent = 'Edit Note';
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content;
        } else {
            this.currentEditingItem = null;
            document.getElementById('noteModalTitle').textContent = 'New Note';
            UI.resetForm('noteForm');
        }

        UI.openModal('noteModal');
        document.getElementById('noteTitle').focus();
    },

    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();

        if (!title) {
            UI.showToast('Please enter a note title', 'error');
            return;
        }

        if (this.currentEditingItem) {
            // Update existing note
            const updated = Storage.updateNote(this.currentProject.id, this.currentEditingItem.id, {
                title,
                content
            });
            
            if (updated) {
                this.currentProject = updated;
                UI.showToast('Note updated!', 'success');
            }
        } else {
            // Create new note
            const updated = Storage.addNote(this.currentProject.id, { title, content });
            
            if (updated) {
                this.currentProject = updated;
                UI.showToast('Note created!', 'success');
            }
        }

        this.renderNotes();
        this.renderProjectInfo();
        UI.closeModal('noteModal');
    },

    viewNote(noteId) {
        const note = this.currentProject.notes.find(n => n.id === noteId);
        if (!note) return;

        // Open in edit mode for viewing/editing
        this.openNoteModal(noteId);
    },

    deleteNote(noteId) {
        UI.confirm('Delete this note?', () => {
            const updated = Storage.deleteNote(this.currentProject.id, noteId);
            
            if (updated) {
                this.currentProject = updated;
                this.renderNotes();
                this.renderProjectInfo();
                UI.showToast('Note deleted', 'success');
            }
        });
    },

    // ===================================
    // References Section
    // ===================================

    renderReferences() {
        const references = this.currentProject.references;
        const container = document.getElementById('referencesList');
        const emptyState = document.getElementById('referencesEmpty');

        if (!container) return;

        if (references.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = references
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(ref => this.createReferenceItem(ref))
            .join('');

        this.bindReferenceEvents();
    },

    createReferenceItem(ref) {
        const linkHTML = ref.url 
            ? `<a href="${ref.url}" target="_blank" class="reference-title">🔗 ${this.escapeHtml(ref.title)}</a>`
            : `<span class="reference-title">${this.escapeHtml(ref.title)}</span>`;

        const notesHTML = ref.notes 
            ? `<p class="reference-notes">${this.escapeHtml(ref.notes)}</p>`
            : '';

        return `
            <div class="reference-item" data-id="${ref.id}">
                <div class="reference-header">
                    <div>
                        ${linkHTML}
                        <div class="reference-meta">
                            <span class="reference-type">${ref.type}</span>
                            ${ref.authors ? `<span>${this.escapeHtml(ref.authors)}</span>` : ''}
                            ${ref.year ? `<span>(${ref.year})</span>` : ''}
                        </div>
                        ${notesHTML}
                    </div>
                    <div class="reference-actions">
                        <button class="btn-icon btn-sm btn-ref-edit" title="Edit">✏️</button>
                        <button class="btn-icon btn-sm btn-ref-delete" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindReferenceEvents() {
        const refItems = document.querySelectorAll('.reference-item');
        
        refItems.forEach(item => {
            const refId = item.dataset.id;
            const editBtn = item.querySelector('.btn-ref-edit');
            const deleteBtn = item.querySelector('.btn-ref-delete');

            if (editBtn) {
                editBtn.addEventListener('click', () => this.openReferenceModal(refId));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteReference(refId));
            }
        });
    },

    openReferenceModal(refId = null) {
        if (refId) {
            const ref = this.currentProject.references.find(r => r.id === refId);
            if (!ref) return;

            this.currentEditingItem = ref;
            document.getElementById('refModalTitle').textContent = 'Edit Reference';
            document.getElementById('refTitle').value = ref.title;
            document.getElementById('refAuthors').value = ref.authors;
            document.getElementById('refYear').value = ref.year;
            document.getElementById('refType').value = ref.type;
            document.getElementById('refUrl').value = ref.url;
            document.getElementById('refNotes').value = ref.notes;
        } else {
            this.currentEditingItem = null;
            document.getElementById('refModalTitle').textContent = 'Add Reference';
            UI.resetForm('referenceForm');
        }

        UI.openModal('referenceModal');
        document.getElementById('refTitle').focus();
    },

    saveReference() {
        const title = document.getElementById('refTitle').value.trim();
        const authors = document.getElementById('refAuthors').value.trim();
        const year = document.getElementById('refYear').value.trim();
        const type = document.getElementById('refType').value;
        const url = document.getElementById('refUrl').value.trim();
        const notes = document.getElementById('refNotes').value.trim();

        if (!title) {
            UI.showToast('Please enter a reference title', 'error');
            return;
        }

        if (this.currentEditingItem) {
            // Update existing reference
            const updated = Storage.updateReference(this.currentProject.id, this.currentEditingItem.id, {
                title, authors, year, type, url, notes
            });
            
            if (updated) {
                this.currentProject = updated;
                UI.showToast('Reference updated!', 'success');
            }
        } else {
            // Create new reference
            const updated = Storage.addReference(this.currentProject.id, {
                title, authors, year, type, url, notes
            });
            
            if (updated) {
                this.currentProject = updated;
                UI.showToast('Reference added!', 'success');
            }
        }

        this.renderReferences();
        this.renderProjectInfo();
        UI.closeModal('referenceModal');
    },

    deleteReference(refId) {
        UI.confirm('Delete this reference?', () => {
            const updated = Storage.deleteReference(this.currentProject.id, refId);
            
            if (updated) {
                this.currentProject = updated;
                this.renderReferences();
                this.renderProjectInfo();
                UI.showToast('Reference deleted', 'success');
            }
        });
    },

    // ===================================
    // Whiteboard Section
    // ===================================

    initCanvas() {
        this.canvas = document.getElementById('whiteboard');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas background to white
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Bind canvas events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Tool buttons
        const penTool = document.getElementById('penTool');
        const eraserTool = document.getElementById('eraserTool');
        const colorPicker = document.getElementById('colorPicker');
        const brushSize = document.getElementById('brushSize');

        if (penTool) {
            penTool.addEventListener('click', () => {
                this.currentTool = 'pen';
                this.updateToolButtons();
            });
        }

        if (eraserTool) {
            eraserTool.addEventListener('click', () => {
                this.currentTool = 'eraser';
                this.updateToolButtons();
            });
        }

        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                this.currentColor = e.target.value;
                this.currentTool = 'pen';
                this.updateToolButtons();
            });
        }

        if (brushSize) {
            brushSize.addEventListener('change', (e) => {
                this.brushSize = parseInt(e.target.value);
            });
        }

        this.updateToolButtons();
    },

    updateToolButtons() {
        const penTool = document.getElementById('penTool');
        const eraserTool = document.getElementById('eraserTool');

        if (penTool) penTool.style.opacity = this.currentTool === 'pen' ? '1' : '0.5';
        if (eraserTool) eraserTool.style.opacity = this.currentTool === 'eraser' ? '1' : '0.5';
    },

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    },

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (this.currentTool === 'eraser') {
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = this.brushSize * 3;
        } else {
            this.ctx.strokeStyle = this.currentColor;
        }

        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    },

    stopDrawing() {
        this.isDrawing = false;
    },

    clearCanvas() {
        UI.confirm('Clear the entire whiteboard?', () => {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            UI.showToast('Canvas cleared', 'success');
        });
    },

    saveWhiteboard() {
        const canvasData = this.canvas.toDataURL('image/png');
        Storage.saveWhiteboard(this.currentProject.id, canvasData);
        UI.showToast('Whiteboard saved!', 'success');
    },

    loadWhiteboard() {
        if (!this.currentProject.whiteboard || !this.ctx) return;

        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.currentProject.whiteboard;
    },

    // ===================================
    // Project Actions
    // ===================================

    editProject() {
        // Redirect to dashboard with edit modal
        window.location.href = `index.html?edit=${this.currentProject.id}`;
    },

    deleteProject() {
        UI.confirm('Are you sure you want to delete this entire project? This action cannot be undone.', () => {
            const success = Storage.deleteProject(this.currentProject.id);
            
            if (success) {
                UI.showToast('Project deleted', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                UI.showToast('Failed to delete project', 'error');
            }
        });
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ProjectDetail.init();
});
