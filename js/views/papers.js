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
        
        return `
            <div class="detail-header">
                <button class="btn btn-secondary" onclick="App.navigate('papers')" style="margin-bottom: 1rem;">← Back to Papers</button>
                <h1 class="detail-title">${paper.title}</h1>
                <div class="detail-meta">
                    <span><strong>Authors:</strong> ${paper.authors}</span>
                    <span><strong>Journal:</strong> ${paper.journal}</span>
                    <span><strong>Year:</strong> ${paper.year}</span>
                    <span class="badge badge-${paper.status.replace('-', '')}">${this.formatStatus(paper.status)}</span>
                </div>
                ${paper.notes ? `<p style="margin-top: 1rem; color: var(--text-secondary);">${paper.notes}</p>` : ''}
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
    
    init() {
        this.renderTable();
    }
};
