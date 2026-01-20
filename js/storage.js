// ========================================
// DATA LAYER - JSON Database Manager
// ========================================

const DataStore = {
    data: {
        projects: [],
        tasks: [],
        papers: [],
        whiteboards: []
    },
    loaded: false,
    
    // Load all data from JSON files
    async loadAll() {
        if (this.loaded) return this.data;
        
        try {
            const [projects, tasks, papers, whiteboards] = await Promise.all([
                fetch('data/projects.json').then(r => r.json()),
                fetch('data/tasks.json').then(r => r.json()),
                fetch('data/papers.json').then(r => r.json()),
                fetch('data/whiteboards.json').then(r => r.json())
            ]);
            
            this.data.projects = projects.projects || [];
            this.data.tasks = tasks.tasks || [];
            this.data.papers = papers.papers || [];
            this.data.whiteboards = whiteboards.whiteboards || [];
            
            this.loaded = true;
            return this.data;
        } catch (error) {
            console.error('Failed to load data:', error);
            return this.data;
        }
    },
    
    // Get all projects
    getProjects() {
        return this.data.projects;
    },
    
    // Get project by ID
    getProject(id) {
        return this.data.projects.find(p => p.id === id);
    },
    
    // Get tasks for a project
    getTasksByProject(projectId) {
        return this.data.tasks.filter(t => t.projectId === projectId);
    },
    
    // Get all tasks
    getTasks() {
        return this.data.tasks;
    },
    
    // Get papers for a project
    getPapersByProject(projectId) {
        return this.data.papers.filter(p => p.projectId === projectId);
    },
    
    // Get all papers
    getPapers() {
        return this.data.papers;
    },
    
    // Get paper by ID
    getPaper(id) {
        return this.data.papers.find(p => p.id === id);
    },
    
    // Get whiteboards for a project
    getWhiteboardsByProject(projectId) {
        return this.data.whiteboards.filter(w => w.projectId === projectId);
    },
    
    // Get all whiteboards
    getWhiteboards() {
        return this.data.whiteboards;
    },
    
    // Get whiteboard by ID
    getWhiteboard(id) {
        return this.data.whiteboards.find(w => w.id === id);
    },
    
    // Get project title by ID (helper)
    getProjectTitle(projectId) {
        const project = this.getProject(projectId);
        return project ? project.title : 'Unknown Project';
    },
    
    // Dashboard helpers
    getActiveProjects() {
        return this.data.projects.filter(p => p.stage === 'in-progress');
    },
    
    getTasksDueThisWeek() {
        const now = Date.now();
        const weekFromNow = now + (7 * 24 * 60 * 60 * 1000);
        return this.data.tasks.filter(t => {
            if (!t.dueDate || t.status === 'done') return false;
            const dueDate = new Date(t.dueDate).getTime();
            return dueDate >= now && dueDate <= weekFromNow;
        });
    },
    
    getPapersToRead() {
        return this.data.papers.filter(p => p.status === 'to-read');
    },
    
    getRecentWhiteboards(limit = 5) {
        return [...this.data.whiteboards]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, limit);
    },
    
    // Stats
    getStats() {
        return {
            totalProjects: this.data.projects.length,
            activeProjects: this.getActiveProjects().length,
            totalTasks: this.data.tasks.length,
            completedTasks: this.data.tasks.filter(t => t.status === 'done').length,
            totalPapers: this.data.papers.length,
            readPapers: this.data.papers.filter(p => p.status === 'read').length
        };
    }
};

// LocalStorage fallback for user data
const Storage = {
    KEYS: {
        THEME: 'research_theme',
        ANNOTATIONS: 'research_annotations',
        SETTINGS: 'research_settings'
    },
    
    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'light';
    },
    
    saveTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },
    
    getAnnotations(paperId) {
        const all = localStorage.getItem(this.KEYS.ANNOTATIONS);
        if (!all) return null;
        const parsed = JSON.parse(all);
        return parsed[paperId] || null;
    },
    
    saveAnnotations(paperId, annotations) {
        const all = localStorage.getItem(this.KEYS.ANNOTATIONS) || '{}';
        const parsed = JSON.parse(all);
        parsed[paperId] = annotations;
        localStorage.setItem(this.KEYS.ANNOTATIONS, JSON.stringify(parsed));
    },
    
    exportAllData() {
        return {
            projects: DataStore.data.projects,
            tasks: DataStore.data.tasks,
            papers: DataStore.data.papers,
            whiteboards: DataStore.data.whiteboards,
            annotations: localStorage.getItem(this.KEYS.ANNOTATIONS),
            exportedAt: Date.now()
        };
    }
};
