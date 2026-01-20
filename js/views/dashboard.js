// ========================================
// DASHBOARD VIEW - Notion-like Widgets
// ========================================

const DashboardView = {
    render() {
        const stats = DataStore.getStats();
        const activeProjects = DataStore.getActiveProjects();
        const tasksDueWeek = DataStore.getTasksDueThisWeek();
        const papersToRead = DataStore.getPapersToRead();
        const recentBoards = DataStore.getRecentWhiteboards(3);
        
        return `
            <div class="page-header">
                <h1 class="page-title">Dashboard</h1>
                <p class="page-subtitle">Your research workspace overview</p>
            </div>
            
            <!-- Stats Row -->
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalProjects}</div>
                    <div class="stat-label">Total Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.activeProjects}</div>
                    <div class="stat-label">Active Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.completedTasks}/${stats.totalTasks}</div>
                    <div class="stat-label">Tasks Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.readPapers}/${stats.totalPapers}</div>
                    <div class="stat-label">Papers Read</div>
                </div>
            </div>
            
            <!-- Widgets Grid -->
            <div class="widget-grid">
                <!-- Active Projects Widget -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">🎯 Active Projects</h3>
                        <a href="#projects" class="text-sm">View all →</a>
                    </div>
                    <div class="widget-content">
                        ${activeProjects.length > 0 ? activeProjects.slice(0, 3).map(p => `
                            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                                <a href="#projects/${p.id}" style="font-weight: 500;">${p.title}</a>
                                <div class="progress-bar" style="margin-top: 0.5rem;">
                                    <div class="progress-fill" style="width: ${p.progress}%"></div>
                                </div>
                                <div style="margin-top: 0.25rem; font-size: 0.75rem; color: var(--text-muted);">
                                    ${p.progress}% complete
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state"><p>No active projects</p></div>'}
                    </div>
                </div>
                
                <!-- Tasks Due This Week -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">✓ Tasks Due This Week</h3>
                        <a href="#tasks" class="text-sm">View all →</a>
                    </div>
                    <div class="widget-content">
                        ${tasksDueWeek.length > 0 ? tasksDueWeek.map(t => `
                            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 500;">${t.title}</div>
                                    <div class="text-xs text-muted">${DataStore.getProjectTitle(t.projectId)}</div>
                                </div>
                                <span class="badge badge-${t.priority}">${t.priority}</span>
                            </div>
                        `).join('') : '<div class="empty-state"><p>No tasks due this week</p></div>'}
                    </div>
                </div>
                
                <!-- Reading Queue -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">📄 Reading Queue</h3>
                        <a href="#papers" class="text-sm">View all →</a>
                    </div>
                    <div class="widget-content">
                        ${papersToRead.length > 0 ? papersToRead.slice(0, 3).map(p => `
                            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                                <a href="#papers/${p.id}" style="font-weight: 500;">${p.title}</a>
                                <div class="text-xs text-muted" style="margin-top: 0.25rem;">
                                    ${p.authors} • ${p.year}
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state"><p>No papers in queue</p></div>'}
                    </div>
                </div>
                
                <!-- Recent Whiteboards -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">🎨 Recent Whiteboards</h3>
                        <a href="#whiteboards" class="text-sm">View all →</a>
                    </div>
                    <div class="widget-content">
                        ${recentBoards.length > 0 ? recentBoards.map(w => `
                            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                                <a href="#whiteboards/${w.id}" style="font-weight: 500;">${w.title}</a>
                                <div class="text-xs text-muted" style="margin-top: 0.25rem;">
                                    ${DataStore.getProjectTitle(w.projectId)} • ${UI.formatDate(w.updatedAt)}
                                </div>
                            </div>
                        `).join('') : '<div class="empty-state"><p>No whiteboards yet</p></div>'}
                    </div>
                </div>
            </div>
        `;
    },
    
    init() {
        // Dashboard doesn't need additional initialization
    }
};
