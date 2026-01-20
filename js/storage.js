// ===================================
// Storage Module - LocalStorage Wrapper
// ===================================

const Storage = {
    // Storage keys
    KEYS: {
        PROJECTS: 'research_projects',
        SETTINGS: 'research_settings',
        THEME: 'research_theme'
    },

    // Initialize storage with default data
    init() {
        if (!this.getProjects()) {
            this.saveProjects([]);
        }
        if (!this.getSettings()) {
            this.saveSettings({
                theme: 'light',
                lastSync: null
            });
        }
    },

    // ===================================
    // Projects CRUD Operations
    // ===================================

    // Get all projects
    getProjects() {
        try {
            const data = localStorage.getItem(this.KEYS.PROJECTS);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting projects:', error);
            return [];
        }
    },

    // Save all projects
    saveProjects(projects) {
        try {
            localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));
            return true;
        } catch (error) {
            console.error('Error saving projects:', error);
            return false;
        }
    },

    // Get single project by ID
    getProject(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id);
    },

    // Create new project
    createProject(projectData) {
        const projects = this.getProjects();
        
        const newProject = {
            id: this.generateId(),
            title: projectData.title || 'Untitled Project',
            description: projectData.description || '',
            status: projectData.status || 'planning',
            tags: projectData.tags || [],
            progress: projectData.progress || 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            
            // Modules data
            overview: {
                goals: '',
                questions: '',
                hypothesis: '',
                currentStatus: ''
            },
            tasks: [],
            notes: [],
            references: [],
            whiteboard: null
        };

        projects.push(newProject);
        this.saveProjects(projects);
        return newProject;
    },

    // Update existing project
    updateProject(id, updates) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        
        if (index === -1) {
            console.error('Project not found:', id);
            return null;
        }

        projects[index] = {
            ...projects[index],
            ...updates,
            updatedAt: Date.now()
        };

        this.saveProjects(projects);
        return projects[index];
    },

    // Delete project
    deleteProject(id) {
        const projects = this.getProjects();
        const filtered = projects.filter(p => p.id !== id);
        
        if (filtered.length === projects.length) {
            return false; // Project not found
        }

        this.saveProjects(filtered);
        return true;
    },

    // ===================================
    // Project Module Operations
    // ===================================

    // Update project overview
    updateOverview(projectId, overview) {
        const project = this.getProject(projectId);
        if (!project) return null;

        return this.updateProject(projectId, {
            overview: { ...project.overview, ...overview }
        });
    },

    // Add task to project
    addTask(projectId, taskData) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const newTask = {
            id: this.generateId(),
            title: taskData.title,
            status: taskData.status || 'todo',
            createdAt: Date.now()
        };

        const tasks = [...project.tasks, newTask];
        const progress = this.calculateProgress(tasks);

        return this.updateProject(projectId, { tasks, progress });
    },

    // Update task
    updateTask(projectId, taskId, updates) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const tasks = project.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        );

        const progress = this.calculateProgress(tasks);

        return this.updateProject(projectId, { tasks, progress });
    },

    // Delete task
    deleteTask(projectId, taskId) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const tasks = project.tasks.filter(task => task.id !== taskId);
        const progress = this.calculateProgress(tasks);

        return this.updateProject(projectId, { tasks, progress });
    },

    // Add note to project
    addNote(projectId, noteData) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const newNote = {
            id: this.generateId(),
            title: noteData.title,
            content: noteData.content,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const notes = [...project.notes, newNote];
        return this.updateProject(projectId, { notes });
    },

    // Update note
    updateNote(projectId, noteId, updates) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const notes = project.notes.map(note =>
            note.id === noteId 
                ? { ...note, ...updates, updatedAt: Date.now() } 
                : note
        );

        return this.updateProject(projectId, { notes });
    },

    // Delete note
    deleteNote(projectId, noteId) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const notes = project.notes.filter(note => note.id !== noteId);
        return this.updateProject(projectId, { notes });
    },

    // Add reference to project
    addReference(projectId, refData) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const newRef = {
            id: this.generateId(),
            title: refData.title,
            authors: refData.authors || '',
            year: refData.year || '',
            type: refData.type || 'paper',
            url: refData.url || '',
            notes: refData.notes || '',
            createdAt: Date.now()
        };

        const references = [...project.references, newRef];
        return this.updateProject(projectId, { references });
    },

    // Update reference
    updateReference(projectId, refId, updates) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const references = project.references.map(ref =>
            ref.id === refId ? { ...ref, ...updates } : ref
        );

        return this.updateProject(projectId, { references });
    },

    // Delete reference
    deleteReference(projectId, refId) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const references = project.references.filter(ref => ref.id !== refId);
        return this.updateProject(projectId, { references });
    },

    // Save whiteboard canvas data
    saveWhiteboard(projectId, canvasData) {
        return this.updateProject(projectId, { whiteboard: canvasData });
    },

    // ===================================
    // Utility Functions
    // ===================================

    // Calculate project progress based on tasks
    calculateProgress(tasks) {
        if (!tasks || tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        return Math.round((completedTasks / tasks.length) * 100);
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // ===================================
    // Settings & Theme
    // ===================================

    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting settings:', error);
            return null;
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'light';
    },

    saveTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },

    // ===================================
    // Import / Export
    // ===================================

    exportData() {
        const data = {
            projects: this.getProjects(),
            settings: this.getSettings(),
            exportedAt: Date.now(),
            version: '1.0'
        };

        return JSON.stringify(data, null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate data structure
            if (!data.projects || !Array.isArray(data.projects)) {
                throw new Error('Invalid data format');
            }

            // Merge with existing projects (avoid duplicates by ID)
            const existingProjects = this.getProjects();
            const existingIds = new Set(existingProjects.map(p => p.id));
            
            const newProjects = data.projects.filter(p => !existingIds.has(p.id));
            const mergedProjects = [...existingProjects, ...newProjects];

            this.saveProjects(mergedProjects);

            return {
                success: true,
                imported: newProjects.length,
                total: mergedProjects.length
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // ===================================
    // Search & Filter
    // ===================================

    searchProjects(query, filters = {}) {
        let projects = this.getProjects();

        // Text search
        if (query) {
            const lowerQuery = query.toLowerCase();
            projects = projects.filter(p =>
                p.title.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery) ||
                p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
            projects = projects.filter(p => p.status === filters.status);
        }

        // Tag filter
        if (filters.tag && filters.tag !== 'all') {
            projects = projects.filter(p => p.tags.includes(filters.tag));
        }

        return projects;
    },

    // Get all unique tags from projects
    getAllTags() {
        const projects = this.getProjects();
        const tagsSet = new Set();

        projects.forEach(project => {
            project.tags.forEach(tag => tagsSet.add(tag));
        });

        return Array.from(tagsSet).sort();
    },

    // Get statistics
    getStats() {
        const projects = this.getProjects();
        
        return {
            total: projects.length,
            planning: projects.filter(p => p.status === 'planning').length,
            inProgress: projects.filter(p => p.status === 'in-progress').length,
            done: projects.filter(p => p.status === 'done').length,
            avgProgress: projects.length > 0
                ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
                : 0
        };
    }
};

// Initialize storage on load
Storage.init();
