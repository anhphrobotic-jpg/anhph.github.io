// Notes View - Standalone note management
const NotesView = {
    init() {
        this.render();
    },

    render() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="view-header">
                <h1>📝 Notes</h1>
                <button class="btn-primary" onclick="NotesView.createNote()">
                    <span class="btn-icon">+</span>
                    New Note
                </button>
            </div>

            <div class="notes-grid" id="notesGrid"></div>
        `;

        this.renderNotesGrid();
    },

    renderNotesGrid() {
        const notes = this.getAllNotes();
        const grid = document.getElementById('notesGrid');
        
        if (notes.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No notes yet</h3>
                    <p>Create your first note to get started</p>
                    <button class="btn-primary" onclick="NotesView.createNote()">
                        <span class="btn-icon">+</span>
                        Create Note
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = notes.map(note => `
            <div class="note-card" onclick="NotesView.openNote('${note.id}')">
                <div class="note-card-header">
                    <h3>${note.title || 'Untitled Note'}</h3>
                    <div class="note-card-actions" onclick="event.stopPropagation()">
                        <button class="btn-icon-sm" onclick="NotesView.renameNote('${note.id}')" title="Rename">
                            ✏️
                        </button>
                        <button class="btn-icon-sm" onclick="NotesView.deleteNote('${note.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="note-card-preview">
                    ${this.getNotePreview(note)}
                </div>
                <div class="note-card-footer">
                    <span class="note-card-date">${this.formatDate(note.updatedAt || note.createdAt)}</span>
                    <span class="note-card-blocks">${note.blocks.length} block${note.blocks.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `).join('');
    },

    getAllNotes() {
        const notes = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('note_standalone_')) {
                try {
                    const note = JSON.parse(localStorage.getItem(key));
                    notes.push(note);
                } catch (e) {
                    console.error('Error parsing note:', key, e);
                }
            }
        }
        return notes.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
        });
    },

    getNotePreview(note) {
        if (!note.blocks || note.blocks.length === 0) {
            return '<span class="note-empty">Empty note</span>';
        }
        
        const firstBlocks = note.blocks.slice(0, 3);
        const preview = firstBlocks.map(block => {
            const content = block.content || '';
            const stripped = content.replace(/<[^>]*>/g, '').trim();
            return stripped ? `<div class="preview-block">${stripped.substring(0, 100)}${stripped.length > 100 ? '...' : ''}</div>` : '';
        }).filter(p => p).join('');
        
        return preview || '<span class="note-empty">Empty note</span>';
    },

    formatDate(dateStr) {
        if (!dateStr) return 'Just now';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    },

    createNote() {
        const noteId = 'note_standalone_' + Date.now();
        const note = {
            id: noteId,
            title: 'Untitled Note',
            blocks: [{
                id: 'block_' + Date.now(),
                type: 'paragraph',
                content: ''
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(noteId, JSON.stringify(note));
        this.openNote(noteId);
    },

    openNote(noteId) {
        const content = document.getElementById('content');
        const note = JSON.parse(localStorage.getItem(noteId));
        
        if (!note) {
            UI.showToast('Note not found', 'error');
            this.render();
            return;
        }

        content.innerHTML = `
            <div class="view-header">
                <button class="btn-text" onclick="NotesView.init()">
                    ← Back to Notes
                </button>
                <div class="note-title-container">
                    <input type="text" 
                           class="note-title-input" 
                           value="${note.title || 'Untitled Note'}"
                           onchange="NotesView.updateNoteTitle('${noteId}', this.value)"
                           placeholder="Untitled Note">
                </div>
                <button class="btn-text" onclick="NotesView.deleteNote('${noteId}')">
                    🗑️ Delete
                </button>
            </div>

            <div class="editor-container">
                ${BlockEditor.renderEditor(noteId)}
            </div>
        `;

        setTimeout(() => {
            BlockEditor.init(noteId);
        }, 100);
    },

    updateNoteTitle(noteId, title) {
        const note = JSON.parse(localStorage.getItem(noteId));
        if (note) {
            note.title = title;
            note.updatedAt = new Date().toISOString();
            localStorage.setItem(noteId, JSON.stringify(note));
        }
    },

    renameNote(noteId) {
        const note = JSON.parse(localStorage.getItem(noteId));
        if (!note) return;

        const newTitle = prompt('Enter new title:', note.title || 'Untitled Note');
        if (newTitle && newTitle.trim()) {
            note.title = newTitle.trim();
            note.updatedAt = new Date().toISOString();
            localStorage.setItem(noteId, JSON.stringify(note));
            this.renderNotesGrid();
            UI.showToast('Note renamed', 'success');
        }
    },

    deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        localStorage.removeItem(noteId);
        UI.showToast('Note deleted', 'success');
        
        // Check if we're viewing the deleted note
        const content = document.getElementById('content');
        if (content.querySelector('.editor-container')) {
            this.init();
        } else {
            this.renderNotesGrid();
        }
    }
};
