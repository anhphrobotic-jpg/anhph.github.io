// Whiteboards View
const WhiteboardsView = {
    render() {
        return `
            <div class="page-header">
                <h1 class="page-title">Whiteboards</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="alert('Create whiteboard feature coming soon')">+ New Whiteboard</button>
                </div>
            </div>
            <div class="database-table">
                <div class="table-header">
                    <h3>All Whiteboards</h3>
                </div>
                <div id="whiteboardsTableBody"></div>
            </div>
        `;
    },
    
    renderTable() {
        const whiteboards = DataStore.getWhiteboards();
        const tbody = document.getElementById('whiteboardsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Project</th>
                        <th>Updated</th>
                    </tr>
                </thead>
                <tbody>
                    ${whiteboards.map(w => `
                        <tr onclick="App.navigate('whiteboards/${w.id}')">
                            <td><strong>${w.title}</strong></td>
                            <td class="text-sm text-secondary">${w.description}</td>
                            <td class="text-sm">${DataStore.getProjectTitle(w.projectId)}</td>
                            <td class="text-sm text-secondary">${UI.formatDate(w.updatedAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    renderDetail(id) {
        const board = DataStore.getWhiteboard(id);
        if (!board) return '<div class="empty-state"><h3>Whiteboard not found</h3></div>';
        
        return `
            <div class="detail-header">
                <button class="btn btn-secondary" onclick="App.navigate('whiteboards')">← Back</button>
                <h1 class="detail-title">${board.title}</h1>
                <p class="text-secondary">${board.description}</p>
            </div>
            <div class="detail-section">
                <canvas id="whiteboardCanvas" width="1200" height="800" style="border: 1px solid var(--border-main); background: white; width: 100%;"></canvas>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="alert('Save feature coming soon')">Save</button>
                    <button class="btn btn-secondary" onclick="alert('Clear feature coming soon')">Clear</button>
                </div>
            </div>
        `;
    },
    
    init() {
        this.renderTable();
    }
};
