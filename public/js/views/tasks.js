// Tasks View
const TasksView = {
    render() {
        return `
            <div class="page-header">
                <h1 class="page-title">Tasks</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="alert('Add task feature coming soon')">+ New Task</button>
                </div>
            </div>
            <div class="database-table">
                <div class="table-header">
                    <h3>All Tasks</h3>
                    <div class="table-controls">
                        <select class="filter-select" id="taskFilter">
                            <option value="all">All Status</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>
                <div id="tasksTableBody"></div>
            </div>
        `;
    },
    
    renderTable() {
        const tasks = DataStore.getTasks();
        const tbody = document.getElementById('tasksTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Project</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${tasks.map(t => `
                        <tr>
                            <td><strong>${t.title}</strong></td>
                            <td class="text-sm text-secondary">${DataStore.getProjectTitle(t.projectId)}</td>
                            <td><span class="badge badge-${t.status}">${t.status}</span></td>
                            <td><span class="badge badge-${t.priority}">${t.priority}</span></td>
                            <td class="text-sm">${UI.formatDate(t.dueDate)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    init() {
        this.renderTable();
    }
};
