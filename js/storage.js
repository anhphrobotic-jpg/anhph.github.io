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
    },
    
    // ========================================
    // CRUD OPERATIONS - TASKS
    // ========================================
    
    createTask(taskData) {
        const newTask = {
            id: `task_${Date.now()}`,
            projectId: taskData.projectId,
            title: taskData.title || 'Untitled Task',
            description: taskData.description || '',
            type: taskData.type || 'research',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || null,
            createdAt: Date.now(),
            completedAt: null
        };
        
        this.data.tasks.push(newTask);
        this._persistTasks();
        return newTask;
    },
    
    updateTask(taskId, updates) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return null;
        }
        
        // Update fields
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                task[key] = updates[key];
            }
        });
        
        // Auto-set completedAt when status changes to done
        if (updates.status === 'done' && !task.completedAt) {
            task.completedAt = Date.now();
        } else if (updates.status !== 'done' && task.completedAt) {
            task.completedAt = null;
        }
        
        this._persistTasks();
        return task;
    },
    
    deleteTask(taskId) {
        const index = this.data.tasks.findIndex(t => t.id === taskId);
        if (index === -1) {
            console.error('Task not found:', taskId);
            return false;
        }
        
        this.data.tasks.splice(index, 1);
        this._persistTasks();
        return true;
    },
    
    _persistTasks() {
        // Save to localStorage as fallback
        localStorage.setItem('research_tasks_data', JSON.stringify({
            tasks: this.data.tasks,
            lastUpdated: Date.now()
        }));
        
        console.log('Tasks persisted to localStorage');
        // In a real app, you would POST to a backend here
        // For GitHub Pages, user must export/download JSON manually
    },
    
    // ========================================
    // CRUD OPERATIONS - PAPERS
    // ========================================
    
    createPaper(paperData) {
        const newPaper = {
            id: `paper_${Date.now()}`,
            projectId: paperData.projectId,
            title: paperData.title || 'Untitled Paper',
            authors: paperData.authors || '',
            journal: paperData.journal || '',
            year: paperData.year || new Date().getFullYear(),
            pdfPath: paperData.pdfPath || '',
            pdfData: paperData.pdfData || null,
            pdfFileName: paperData.pdfFileName || '',
            status: paperData.status || 'to-read',
            importance: paperData.importance || 'medium',
            notes: paperData.notes || '',
            keyTakeaways: paperData.keyTakeaways || [],
            tags: paperData.tags || [],
            createdAt: Date.now(),
            readAt: null
        };
        
        this.data.papers.push(newPaper);
        this._persistPapers();
        return newPaper;
    },
    
    updatePaper(paperId, updates) {
        const paper = this.data.papers.find(p => p.id === paperId);
        if (!paper) {
            console.error('Paper not found:', paperId);
            return null;
        }
        
        // Update fields
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                paper[key] = updates[key];
            }
        });
        
        // Auto-set readAt when status changes to read
        if (updates.status === 'read' && !paper.readAt) {
            paper.readAt = Date.now();
        }
        
        this._persistPapers();
        return paper;
    },
    
    deletePaper(paperId) {
        const index = this.data.papers.findIndex(p => p.id === paperId);
        if (index === -1) {
            console.error('Paper not found:', paperId);
            return false;
        }
        
        this.data.papers.splice(index, 1);
        this._persistPapers();
        
        // Also delete annotations for this paper
        const annotationsKey = Storage.KEYS.ANNOTATIONS;
        const allAnnotations = localStorage.getItem(annotationsKey);
        if (allAnnotations) {
            const parsed = JSON.parse(allAnnotations);
            delete parsed[paperId];
            localStorage.setItem(annotationsKey, JSON.stringify(parsed));
        }
        
        return true;
    },
    
    _persistPapers() {
        // Clone papers array and remove large pdfData to avoid localStorage quota exceeded
        const papersToSave = this.data.papers.map(paper => {
            const { pdfData, ...paperWithoutPdfData } = paper;
            return paperWithoutPdfData;
        });
        
        try {
            localStorage.setItem('research_papers_data', JSON.stringify({
                papers: papersToSave,
                lastUpdated: Date.now()
            }));
            console.log('Papers persisted to localStorage (without pdfData)');
        } catch (error) {
            console.error('Error persisting papers:', error);
            UI.showToast('Warning: Cannot save papers to storage', 'warning');
        }
    },
    
    // ========================================
    // CRUD OPERATIONS - PROJECTS
    // ========================================
    
    updateProject(projectId, updates) {
        const project = this.data.projects.find(p => p.id === projectId);
        if (!project) {
            console.error('Project not found:', projectId);
            return null;
        }
        
        // Update fields
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                project[key] = updates[key];
            }
        });
        
        project.updatedAt = Date.now();
        
        this._persistProjects();
        return project;
    },
    
    _persistProjects() {
        localStorage.setItem('research_projects_data', JSON.stringify({
            projects: this.data.projects,
            lastUpdated: Date.now()
        }));
        
        console.log('Projects persisted to localStorage');
    },
    
    // ========================================
    // BATCH OPERATIONS
    // ========================================
    
    // Create task directly from paper reading
    createTaskFromPaper(paperId, taskData) {
        const paper = this.getPaper(paperId);
        if (!paper) {
            console.error('Paper not found:', paperId);
            return null;
        }
        
        return this.createTask({
            ...taskData,
            projectId: paper.projectId,
            description: taskData.description + `\n\n(Derived from paper: ${paper.title})`
        });
    },
    
    // Load persisted data from localStorage on startup
    loadPersistedData() {
        try {
            const tasks = localStorage.getItem('research_tasks_data');
            if (tasks) {
                const parsed = JSON.parse(tasks);
                this.data.tasks = parsed.tasks || [];
                console.log('Loaded persisted tasks from localStorage');
            }
            
            const papers = localStorage.getItem('research_papers_data');
            if (papers) {
                const parsed = JSON.parse(papers);
                this.data.papers = parsed.papers || [];
                console.log('Loaded persisted papers from localStorage');
            }
            
            const projects = localStorage.getItem('research_projects_data');
            if (projects) {
                const parsed = JSON.parse(projects);
                this.data.projects = parsed.projects || [];
                console.log('Loaded persisted projects from localStorage');
            }
        } catch (error) {
            console.error('Error loading persisted data:', error);
        }
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
    
    setTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },
    
    getAnnotations(paperId) {
        const all = localStorage.getItem(this.KEYS.ANNOTATIONS);
        if (!all) return null;
        const parsed = JSON.parse(all);
        return parsed[paperId] || null;
    },
    
    setAnnotations(paperId, annotations) {
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
