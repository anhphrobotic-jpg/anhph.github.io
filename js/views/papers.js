// Papers View with PDF Viewer
const PapersView = {
    render() {
        return `
            <div class="page-header">
                <h1 class="page-title">Papers & References</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="alert('Upload PDF feature - place PDFs in assets/pdf/')">
                        + Add Paper
                    </button>
                </div>
            </div>
            <div class="database-table">
                <div class="table-header">
                    <h3>Research Papers</h3>
                    <div class="table-controls">
                        <input type="text" class="search-input" placeholder="Search papers...">
                        <select class="filter-select" id="paperFilter">
                            <option value="all">All Status</option>
                            <option value="to-read">To Read</option>
                            <option value="reading">Reading</option>
                            <option value="read">Read</option>
                        </select>
                    </div>
                </div>
                <div id="papersTableBody"></div>
            </div>
        `;
    },
    
    renderTable() {
        const papers = DataStore.getPapers();
        const tbody = document.getElementById('papersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Authors</th>
                        <th>Journal/Venue</th>
                        <th>Year</th>
                        <th>Status</th>
                        <th>Project</th>
                    </tr>
                </thead>
                <tbody>
                    ${papers.map(p => `
                        <tr onclick="App.navigate('papers/${p.id}')">
                            <td><strong>${p.title}</strong></td>
                            <td class="text-sm">${p.authors}</td>
                            <td class="text-sm">${p.journal}</td>
                            <td>${p.year}</td>
                            <td><span class="badge badge-${p.status.replace('-', '')}">${this.formatStatus(p.status)}</span></td>
                            <td class="text-sm text-secondary">${DataStore.getProjectTitle(p.projectId)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    renderDetail(id) {
        const paper = DataStore.getPaper(id);
        if (!paper) return '<div class="empty-state"><h3>Paper not found</h3></div>';
        
        const project = DataStore.getProject(paper.projectId);
        
        return `
            <div class="detail-header">
                <button class="btn btn-secondary" onclick="App.navigate('papers')" style="margin-bottom: 1rem;">← Back to Papers</button>
                <h1 class="detail-title">${paper.title}</h1>
                <div class="detail-meta">
                    <span><strong>Authors:</strong> ${paper.authors}</span>
                    <span><strong>Journal:</strong> ${paper.journal}</span>
                    <span><strong>Year:</strong> ${paper.year}</span>
                    <span class="badge badge-${paper.status.replace('-', '')}">${this.formatStatus(paper.status)}</span>
                    <span class="badge badge-${paper.importance}">Importance: ${paper.importance}</span>
                </div>
                <div class="detail-meta">
                    <span><strong>Project:</strong> <a href="#projects/${paper.projectId}">${project ? project.title : 'Unknown'}</a></span>
                </div>
                ${paper.notes ? `<p style="margin-top: 1rem; color: var(--text-secondary);">${paper.notes}</p>` : ''}
            </div>
            
            ${paper.keyTakeaways && paper.keyTakeaways.length > 0 ? `
                <div class="detail-section">
                    <h3 class="section-title">💡 Key Takeaways</h3>
                    <ul class="takeaways-list">
                        ${paper.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                    <button class="btn btn-primary btn-sm" onclick="PapersView.showAddTakeawayModal('${paper.id}')">+ Add Takeaway</button>
                </div>
            ` : `
                <div class="detail-section">
                    <h3 class="section-title">💡 Key Takeaways</h3>
                    <p class="text-secondary">No takeaways yet. Add them as you read the paper.</p>
                    <button class="btn btn-primary btn-sm" onclick="PapersView.showAddTakeawayModal('${paper.id}')">+ Add Takeaway</button>
                </div>
            `}
            
            <div class="detail-section">
                <h3 class="section-title">⚡ Create Task from This Paper</h3>
                <p class="text-secondary">Derive action items directly from your reading</p>
                <button class="btn btn-primary" onclick="PapersView.showCreateTaskFromPaperModal('${paper.id}')">+ Create Task</button>
            </div>
            
            <div class="detail-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 class="section-title">PDF Viewer</h3>
                    <button class="btn btn-sm btn-secondary" onclick="PDFViewer.openFullscreen('${paper.id}')">
                        Open Fullscreen
                    </button>
                </div>
                <div id="pdfViewerContainer"></div>
            </div>
        `;
    },
    
    formatStatus(status) {
        return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },
    
    showAddTakeawayModal(paperId) {
        const modal = `
            <div class="modal active" id="takeawayModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add Key Takeaway</h3>
                        <button class="modal-close" onclick="PapersView.closeModal('takeawayModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Takeaway</label>
                            <textarea id="takeawayText" class="form-input" rows="3" placeholder="What did you learn from this paper?"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="PapersView.closeModal('takeawayModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="PapersView.addTakeaway('${paperId}')">Add</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    addTakeaway(paperId) {
        const text = document.getElementById('takeawayText').value.trim();
        if (!text) {
            alert('Please enter a takeaway');
            return;
        }
        
        const paper = DataStore.getPaper(paperId);
        const takeaways = paper.keyTakeaways || [];
        takeaways.push(text);
        
        DataStore.updatePaper(paperId, { keyTakeaways: takeaways });
        this.closeModal('takeawayModal');
        
        App.navigate(`papers/${paperId}`);
        UI.showToast('Takeaway added!', 'success');
    },
    
    showCreateTaskFromPaperModal(paperId) {
        const paper = DataStore.getPaper(paperId);
        const modal = `
            <div class="modal active" id="taskFromPaperModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create Task from Paper</h3>
                        <button class="modal-close" onclick="PapersView.closeModal('taskFromPaperModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <p class="text-secondary" style="margin-bottom: 1rem;">
                            Creating task for: <strong>${paper.title}</strong>
                        </p>
                        <div class="form-group">
                            <label>Task Title *</label>
                            <input type="text" id="taskFromPaperTitle" class="form-input" placeholder="e.g., Implement attention mechanism from this paper">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="taskFromPaperDescription" class="form-input" rows="3" placeholder="What specific action will you take based on this paper?"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Type</label>
                                <select id="taskFromPaperType" class="form-input">
                                    <option value="research">Research</option>
                                    <option value="implementation" selected>Implementation</option>
                                    <option value="experiment">Experiment</option>
                                    <option value="writing">Writing</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Priority</label>
                                <select id="taskFromPaperPriority" class="form-input">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Due Date</label>
                            <input type="date" id="taskFromPaperDueDate" class="form-input">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="PapersView.closeModal('taskFromPaperModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="PapersView.createTaskFromPaper('${paperId}')">Create Task</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    createTaskFromPaper(paperId) {
        const title = document.getElementById('taskFromPaperTitle').value.trim();
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const taskData = {
            title: title,
            description: document.getElementById('taskFromPaperDescription').value.trim(),
            type: document.getElementById('taskFromPaperType').value,
            priority: document.getElementById('taskFromPaperPriority').value,
            dueDate: document.getElementById('taskFromPaperDueDate').value || null
        };
        
        const task = DataStore.createTaskFromPaper(paperId, taskData);
        this.closeModal('taskFromPaperModal');
        
        UI.showToast(`Task created! View in <a href="#projects/${task.projectId}">project</a>`, 'success', 5000);
    },
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    },
    
    init() {
        this.renderTable();
    }
};
