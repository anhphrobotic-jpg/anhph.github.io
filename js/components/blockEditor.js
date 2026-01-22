// ================================================
// NOTION-LIKE BLOCK EDITOR
// ================================================
// A fully-featured block-based editor with:
// - Slash commands
// - Keyboard shortcuts
// - Inline formatting
// - Auto-save
// - JSON persistence

const BlockEditor = {
    currentNoteId: null,
    blocks: [],
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
    autoSaveTimer: null,
    commandMenuActive: false,
    commandMenuBlockId: null,
    commandMenuQuery: '',
    menuKeyboardHandler: null,
    selectionToolbarVisible: false,
    draggedBlockId: null,
    dropIndicatorVisible: false,
    isProcessingHistory: false,
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    init(noteId, projectId = null) {
        this.currentNoteId = noteId;
        
        // Ensure note exists in localStorage
        let note = this.loadNote(noteId);
        if (!note) {
            // Extract projectId from noteId if not provided
            if (!projectId && noteId.startsWith('note_project_')) {
                projectId = noteId.replace('note_project_', '');
            }
            note = this.createNewNote(noteId, projectId);
            this.saveNote(note);
            console.log('✅ Created new note:', noteId);
        } else {
            console.log('✅ Loaded existing note:', noteId);
        }
        
        this.setupEventListeners();
        this.startAutoSave();
    },
    
    destroy() {
        this.stopAutoSave();
        this.saveNote();
    },
    
    // ========================================
    // RENDER EDITOR
    // ========================================
    
    renderEditor(noteId, projectId, noteData = null) {
        this.currentNoteId = noteId;
        
        // Load existing note or create new
        const note = noteData || this.loadNote(noteId) || this.createNewNote(noteId, projectId);
        
        return `
            <div class="block-editor-container" id="blockEditor-${noteId}">
                <div class="editor-header">
                    <input 
                        type="text" 
                        class="editor-title" 
                        placeholder="Untitled Note"
                        value="${note.title || ''}"
                        onchange="BlockEditor.updateTitle('${noteId}', this.value)"
                    />
                    <div class="editor-meta">
                        <span class="meta-item">Last saved: <span id="lastSaved-${noteId}">Just now</span></span>
                        <button class="btn-icon" onclick="BlockEditor.exportToMarkdown('${noteId}')" title="Export to Markdown">📥</button>
                    </div>
                </div>
                
                <div class="blocks-container" id="blocksContainer-${noteId}">
                    ${note.blocks.length > 0 
                        ? note.blocks.map((block, index) => this.renderBlock(block, index)).join('')
                        : this.renderBlock(this.createBlock('paragraph'), 0)
                    }
                </div>
                
                <div class="editor-footer">
                    <button class="btn-text" onclick="BlockEditor.addBlock('paragraph')">+ Add Block</button>
                </div>
                
                <!-- Selection Toolbar -->
                <div class="selection-toolbar" id="selectionToolbar-${noteId}" style="display: none;">
                    <button class="toolbar-btn" onclick="BlockEditor.formatSelection('bold')" title="Bold (Ctrl+B)"><strong>B</strong></button>
                    <button class="toolbar-btn" onclick="BlockEditor.formatSelection('italic')" title="Italic (Ctrl+I)"><em>I</em></button>
                    <button class="toolbar-btn" onclick="BlockEditor.formatSelection('underline')" title="Underline (Ctrl+U)"><u>U</u></button>
                    <button class="toolbar-btn" onclick="BlockEditor.formatSelection('strikethrough')" title="Strikethrough"><s>S</s></button>
                    <button class="toolbar-btn" onclick="BlockEditor.formatSelection('code')" title="Inline Code">&lt;/&gt;</button>
                    <button class="toolbar-btn" onclick="BlockEditor.insertLink()" title="Link">🔗</button>
                    <button class="toolbar-btn" onclick="BlockEditor.showColorPicker()" title="Color">🎨</button>
                </div>
                
                <!-- Color Picker -->
                <div class="color-picker-popup" id="colorPicker-${noteId}" style="display: none;">
                    <div class="color-picker-header">Text Color</div>
                    <div class="color-grid">
                        <button class="color-swatch" data-color="#000000" style="background: #000000" title="Black"></button>
                        <button class="color-swatch" data-color="#4d4d4d" style="background: #4d4d4d" title="Dark Gray"></button>
                        <button class="color-swatch" data-color="#999999" style="background: #999999" title="Gray"></button>
                        <button class="color-swatch" data-color="#ffffff" style="background: #ffffff; border: 1px solid #ddd" title="White"></button>
                        <button class="color-swatch" data-color="#e03e3e" style="background: #e03e3e" title="Red"></button>
                        <button class="color-swatch" data-color="#d9730d" style="background: #d9730d" title="Orange"></button>
                        <button class="color-swatch" data-color="#dfab01" style="background: #dfab01" title="Yellow"></button>
                        <button class="color-swatch" data-color="#4d6b2a" style="background: #4d6b2a" title="Green"></button>
                        <button class="color-swatch" data-color="#0f7b6c" style="background: #0f7b6c" title="Teal"></button>
                        <button class="color-swatch" data-color="#0b6e99" style="background: #0b6e99" title="Blue"></button>
                        <button class="color-swatch" data-color="#6940a5" style="background: #6940a5" title="Purple"></button>
                        <button class="color-swatch" data-color="#ad1a72" style="background: #ad1a72" title="Pink"></button>
                        <button class="color-swatch" data-color="#ff6b6b" style="background: #ff6b6b" title="Light Red"></button>
                        <button class="color-swatch" data-color="#ffa94d" style="background: #ffa94d" title="Light Orange"></button>
                        <button class="color-swatch" data-color="#ffd43b" style="background: #ffd43b" title="Light Yellow"></button>
                        <button class="color-swatch" data-color="#74c0fc" style="background: #74c0fc" title="Light Blue"></button>
                    </div>
                </div>
                
                <!-- Command Menu -->
                <div class="command-menu" id="commandMenu-${noteId}" style="display: none;">
                    <div class="command-list">
                        <div class="command-item" data-command="text">
                            <span class="command-icon">📝</span>
                            <span class="command-label">Text</span>
                            <span class="command-desc">Plain paragraph</span>
                        </div>
                        <div class="command-item" data-command="h1">
                            <span class="command-icon">H1</span>
                            <span class="command-label">Heading 1</span>
                            <span class="command-desc">Large section heading</span>
                        </div>
                        <div class="command-item" data-command="h2">
                            <span class="command-icon">H2</span>
                            <span class="command-label">Heading 2</span>
                            <span class="command-desc">Medium section heading</span>
                        </div>
                        <div class="command-item" data-command="h3">
                            <span class="command-icon">H3</span>
                            <span class="command-label">Heading 3</span>
                            <span class="command-desc">Small section heading</span>
                        </div>
                        <div class="command-item" data-command="bullet">
                            <span class="command-icon">•</span>
                            <span class="command-label">Bullet List</span>
                            <span class="command-desc">Unordered list</span>
                        </div>
                        <div class="command-item" data-command="number">
                            <span class="command-icon">1.</span>
                            <span class="command-label">Numbered List</span>
                            <span class="command-desc">Ordered list</span>
                        </div>
                        <div class="command-item" data-command="todo">
                            <span class="command-icon">☐</span>
                            <span class="command-label">Todo</span>
                            <span class="command-desc">Checkbox list</span>
                        </div>
                        <div class="command-item" data-command="code">
                            <span class="command-icon">&lt;/&gt;</span>
                            <span class="command-label">Code Block</span>
                            <span class="command-desc">Monospace code</span>
                        </div>
                        <div class="command-item" data-command="quote">
                            <span class="command-icon">"</span>
                            <span class="command-label">Quote</span>
                            <span class="command-desc">Highlighted quote</span>
                        </div>
                        <div class="command-item" data-command="divider">
                            <span class="command-icon">―</span>
                            <span class="command-label">Divider</span>
                            <span class="command-desc">Visual separator</span>
                        </div>
                        <div class="command-item" data-command="callout">
                            <span class="command-icon">💡</span>
                            <span class="command-label">Callout</span>
                            <span class="command-desc">Highlighted box</span>
                        </div>
                        <div class="command-item" data-command="toggle">
                            <span class="command-icon">▶</span>
                            <span class="command-label">Toggle</span>
                            <span class="command-desc">Collapsible content</span>
                        </div>
                        <div class="command-item" data-command="image">
                            <span class="command-icon">🖼️</span>
                            <span class="command-label">Image</span>
                            <span class="command-desc">Upload or embed image</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ========================================
    // BLOCK MANAGEMENT
    // ========================================
    
    createBlock(type = 'paragraph', content = '', properties = {}) {
        return {
            id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type,
            content: content,
            properties: properties,
            createdAt: Date.now()
        };
    },
    
    renderBlock(block, index) {
        const blockClass = `block block-${block.type}`;
        const blockId = block.id;
        const handleHtml = `
            <div class="block-handle" 
                 draggable="true"
                 ondragstart="BlockEditor.handleDragStart(event, '${blockId}')"
                 ondragend="BlockEditor.handleDragEnd(event)"
                 onclick="BlockEditor.showBlockMenu(event, '${blockId}')">
                ⋮⋮
            </div>
        `;
        
        switch (block.type) {
            case 'h1':
            case 'h2':
            case 'h3':
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <${block.type} 
                            class="block-content editable" 
                            contenteditable="true"
                            data-placeholder="Heading"
                            onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                            onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                            oninput="BlockEditor.updateBlockContent('${blockId}')"
                        >${block.content}</${block.type}>
                    </div>
                `;
                
            case 'bullet':
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div class="list-item">
                            <span class="list-marker">•</span>
                            <div 
                                class="block-content editable" 
                                contenteditable="true"
                                data-placeholder="List item"
                                onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                                onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                                oninput="BlockEditor.updateBlockContent('${blockId}')"
                            >${block.content}</div>
                        </div>
                    </div>
                `;
                
            case 'number':
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div class="list-item">
                            <span class="list-marker">${index + 1}.</span>
                            <div 
                                class="block-content editable" 
                                contenteditable="true"
                                data-placeholder="List item"
                                onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                                onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                                oninput="BlockEditor.updateBlockContent('${blockId}')"
                            >${block.content}</div>
                        </div>
                    </div>
                `;
                
            case 'todo':
                const checked = block.properties.checked || false;
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div class="todo-item">
                            <input 
                                type="checkbox" 
                                class="todo-checkbox"
                                ${checked ? 'checked' : ''}
                                onchange="BlockEditor.toggleTodo('${blockId}', this.checked)"
                            />
                            <div 
                                class="block-content editable ${checked ? 'completed' : ''}" 
                                contenteditable="true"
                                data-placeholder="Todo item"
                                onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                                onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                                oninput="BlockEditor.updateBlockContent('${blockId}')"
                            >${block.content}</div>
                        </div>
                    </div>
                `;
                
            case 'code':
                const language = block.properties.language || 'javascript';
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div class="code-block-wrapper">
                            <div class="code-header">
                                <select 
                                    class="code-language-select"
                                    onchange="BlockEditor.setCodeLanguage('${blockId}', this.value)"
                                >
                                    <option value="javascript" ${language === 'javascript' ? 'selected' : ''}>JavaScript</option>
                                    <option value="python" ${language === 'python' ? 'selected' : ''}>Python</option>
                                    <option value="html" ${language === 'html' ? 'selected' : ''}>HTML</option>
                                    <option value="css" ${language === 'css' ? 'selected' : ''}>CSS</option>
                                    <option value="sql" ${language === 'sql' ? 'selected' : ''}>SQL</option>
                                    <option value="bash" ${language === 'bash' ? 'selected' : ''}>Bash</option>
                                </select>
                                <button class="btn-copy" onclick="BlockEditor.copyCode('${blockId}')" title="Copy">📋</button>
                            </div>
                            <pre 
                                class="block-content editable code-content" 
                                contenteditable="true"
                                data-placeholder="// Write code here"
                                onkeydown="BlockEditor.handleCodeKeyDown(event, '${blockId}')"
                                oninput="BlockEditor.updateBlockContent('${blockId}')"
                            >${this.escapeHtml(block.content)}</pre>
                        </div>
                    </div>
                `;
                
            case 'quote':
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <blockquote 
                            class="block-content editable" 
                            contenteditable="true"
                            data-placeholder="Quote or callout"
                            onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                            onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                            oninput="BlockEditor.updateBlockContent('${blockId}')"
                        >${block.content}</blockquote>
                    </div>
                `;
                
            case 'divider':
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <hr class="block-divider" />
                    </div>
                `;
                
            case 'callout':
                const emoji = block.properties.emoji || '💡';
                const bgColor = block.properties.backgroundColor || 'info';
                return `
                    <div class="${blockClass} callout-${bgColor}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div class="callout-content">
                            <span class="callout-emoji" onclick="BlockEditor.changeEmoji('${blockId}')">${emoji}</span>
                            <div 
                                class="block-content editable" 
                                contenteditable="true"
                                data-placeholder="Type something..."
                                onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                                onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                                oninput="BlockEditor.updateBlockContent('${blockId}')"
                            >${block.content}</div>
                        </div>
                    </div>
                `;
                
            case 'toggle':
                const isOpen = block.properties.isOpen !== false;
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div class="toggle-header" onclick="BlockEditor.toggleCollapse('${blockId}')">
                            <span class="toggle-arrow ${isOpen ? 'open' : ''}">▶</span>
                            <div 
                                class="block-content editable" 
                                contenteditable="true"
                                data-placeholder="Toggle title"
                                onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                                onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                                oninput="BlockEditor.updateBlockContent('${blockId}')"
                            >${block.content}</div>
                        </div>
                        <div class="toggle-content" style="display: ${isOpen ? 'block' : 'none'}">
                            <div class="toggle-children" contenteditable="true" data-placeholder="Hidden content...">${block.properties.hiddenContent || ''}</div>
                        </div>
                    </div>
                `;
                
            case 'image':
                const imageUrl = block.properties.url || '';
                const caption = block.properties.caption || '';
                const imageWidth = block.properties.width || '100%';
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div class="image-block-wrapper">
                            ${imageUrl ? `
                                <img src="${imageUrl}" alt="${caption}" style="max-width: ${imageWidth}; width: 100%; border-radius: var(--radius-md);" />
                                <div class="image-actions">
                                    <button class="btn-sm btn-secondary" onclick="BlockEditor.changeImageUrl('${blockId}')">Change URL</button>
                                    <button class="btn-sm btn-secondary" onclick="BlockEditor.uploadImage('${blockId}')">Upload</button>
                                    <button class="btn-sm btn-secondary" onclick="BlockEditor.setImageWidth('${blockId}')">Resize</button>
                                </div>
                            ` : `
                                <div class="image-placeholder">
                                    <button class="btn-primary" onclick="BlockEditor.uploadImage('${blockId}')">📷 Upload Image</button>
                                    <button class="btn-secondary" onclick="BlockEditor.changeImageUrl('${blockId}')">🔗 Add URL</button>
                                </div>
                            `}
                            <div 
                                class="image-caption editable" 
                                contenteditable="true"
                                data-placeholder="Add a caption..."
                                oninput="BlockEditor.updateImageCaption('${blockId}')"
                            >${caption}</div>
                        </div>
                    </div>
                `;
                
            case 'paragraph':
            default:
                return `
                    <div class="${blockClass}" data-block-id="${blockId}" data-index="${index}"
                         ondragover="BlockEditor.handleDragOver(event)"
                         ondrop="BlockEditor.handleDrop(event, '${blockId}')">
                        ${handleHtml}
                        <div 
                            class="block-content editable" 
                            contenteditable="true"
                            data-placeholder=""
                            onkeydown="BlockEditor.handleKeyDown(event, '${blockId}')"
                            onkeyup="BlockEditor.handleKeyUp(event, '${blockId}')"
                            oninput="BlockEditor.updateBlockContent('${blockId}')"
                        >${block.content}</div>
                    </div>
                `;
        }
    },
    
    // ========================================
    // KEYBOARD HANDLERS
    // ========================================
    
    handleKeyDown(event, blockId) {
        const block = this.getBlock(blockId);
        const element = event.target;
        const content = element.textContent || '';
        
        // Enter: Create new block
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.createNewBlockAfter(blockId);
            this.saveHistory();
            return;
        }
        
        // Backspace on empty block: Delete block
        if (event.key === 'Backspace' && content === '') {
            event.preventDefault();
            this.deleteBlock(blockId);
            this.saveHistory();
            return;
        }
        
        // If command menu is active, handle special keys FIRST
        if (this.commandMenuActive && this.commandMenuBlockId === blockId) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                event.stopPropagation();
                // These will be handled by menu keyboard navigation
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                this.hideCommandMenu();
                // Clear the / character
                element.textContent = '';
                return;
            }
        }
        
        // If tag menu is active, handle special keys
        if (this.tagMenuActive && this.tagMenuBlockId === blockId) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                this.hideTagMenu();
                return;
            }
        }
        
        // Slash command - show menu when typing /
        if (event.key === '/' && content === '') {
            // Don't prevent default - let the / character be typed
            setTimeout(() => {
                this.showCommandMenu(blockId);
            }, 0);
            return;
        }
        
        // Tab: Indent (for lists)
        if (event.key === 'Tab') {
            event.preventDefault();
            if (block.type === 'bullet' || block.type === 'number') {
                this.indentBlock(blockId, !event.shiftKey);
            }
            return;
        }
        
        // Arrow Up: Move to previous block
        if (event.key === 'ArrowUp' && this.isAtStart(element)) {
            event.preventDefault();
            this.focusPreviousBlock(blockId);
            return;
        }
        
        // Arrow Down: Move to next block
        if (event.key === 'ArrowDown' && this.isAtEnd(element)) {
            event.preventDefault();
            this.focusNextBlock(blockId);
            return;
        }
        
        // Undo/Redo
        if (event.ctrlKey || event.metaKey) {
            if (event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                this.undo();
                return;
            }
            if (event.key === 'z' && event.shiftKey || event.key === 'y') {
                event.preventDefault();
                this.redo();
                return;
            }
            
            // Bold
            if (event.key === 'b') {
                event.preventDefault();
                document.execCommand('bold');
                return;
            }
            
            // Italic
            if (event.key === 'i') {
                event.preventDefault();
                document.execCommand('italic');
                return;
            }
            
            // Underline
            if (event.key === 'u') {
                event.preventDefault();
                document.execCommand('underline');
                return;
            }
            
            // Link
            if (event.key === 'k') {
                event.preventDefault();
                this.insertLink();
                return;
            }
            
            // Save
            if (event.key === 's') {
                event.preventDefault();
                this.saveNote();
                UI.showToast('Note saved', 'success');
                return;
            }
        }
    },
    
    handleKeyUp(event, blockId) {
        const element = event.target;
        const content = element.textContent || '';
        
        // Filter command menu if active (but not for navigation keys)
        if (this.commandMenuActive && this.commandMenuBlockId === blockId) {
            // Don't filter when using navigation keys
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === 'Escape') {
                return;
            }
            
            if (content.startsWith('/')) {
                const query = content.substring(1).toLowerCase();
                this.filterCommandMenu(query);
            } else {
                this.hideCommandMenu();
            }
        }
        
        // Handle tag menu
        if (this.tagMenuActive && this.tagMenuBlockId === blockId) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === 'Escape') {
                return;
            }
            
            // Find the @ position and extract search query
            const atMatch = content.match(/@(\w*)$/);
            if (atMatch) {
                const query = atMatch[1].toLowerCase();
                this.filterTagMenu(query);
            } else {
                this.hideTagMenu();
            }
        }
        
        // Check for @ to show tag menu (if not already active)
        if (!this.tagMenuActive && !this.commandMenuActive) {
            const atMatch = content.match(/@(\w*)$/);
            if (atMatch) {
                setTimeout(() => {
                    if (!this.tagMenuActive) {
                        this.showTagMenu(blockId);
                    }
                }, 0);
            }
        }
        
        // Check for @tag pattern and convert to link
        if (event.key === ' ' || event.key === 'Enter') {
            this.convertTagsToLinks(element);
        }
        
        // Check for markdown shortcuts
        this.checkMarkdownShortcuts(blockId);
        // Save history on content change
        if (!this.isProcessingHistory && event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            clearTimeout(this._historyTimeout);
            this._historyTimeout = setTimeout(() => this.saveHistory(), 500);
        }
    },
    
    handleCodeKeyDown(event, blockId) {
        // Tab in code block should insert spaces
        if (event.key === 'Tab') {
            event.preventDefault();
            document.execCommand('insertText', false, '    ');
            return;
        }
        
        // Enter in code block should just add newline
        if (event.key === 'Enter') {
            event.preventDefault();
            document.execCommand('insertText', false, '\n');
            return;
        }
    },
    
    // ========================================
    // MARKDOWN SHORTCUTS
    // ========================================
    
    checkMarkdownShortcuts(blockId) {
        const block = this.getBlock(blockId);
        if (!block) return;
        
        const element = document.querySelector(`[data-block-id="${blockId}"] .block-content`);
        if (!element) return;
        
        const content = element.textContent || '';
        
        // Check for markdown patterns at start of line
        if (content.match(/^#{1,3}\s/)) {
            const level = content.match(/^(#{1,3})/)[1].length;
            const newContent = content.replace(/^#{1,3}\s/, '');
            this.convertBlockType(blockId, `h${level}`, newContent);
        }
        else if (content.match(/^[-*]\s/)) {
            const newContent = content.replace(/^[-*]\s/, '');
            this.convertBlockType(blockId, 'bullet', newContent);
        }
        else if (content.match(/^\d+\.\s/)) {
            const newContent = content.replace(/^\d+\.\s/, '');
            this.convertBlockType(blockId, 'number', newContent);
        }
        else if (content.match(/^\[\s?\]\s/)) {
            const newContent = content.replace(/^\[\s?\]\s/, '');
            this.convertBlockType(blockId, 'todo', newContent);
        }
        else if (content.match(/^```/)) {
            const newContent = content.replace(/^```/, '');
            this.convertBlockType(blockId, 'code', newContent);
        }
        else if (content.match(/^>\s/)) {
            const newContent = content.replace(/^>\s/, '');
            this.convertBlockType(blockId, 'quote', newContent);
        }
        else if (content.match(/^---$/)) {
            this.convertBlockType(blockId, 'divider', '');
        }
        
        // Check for inline markdown
        this.processInlineMarkdown(element);
    },
    
    processInlineMarkdown(element) {
        let html = element.innerHTML;
        
        // Bold: **text** or __text__
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
        
        // Italic: *text* or _text_
        html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
        
        // Inline code: `code`
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        
        if (html !== element.innerHTML) {
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            const startOffset = range ? range.startOffset : 0;
            
            element.innerHTML = html;
            
            // Restore cursor position
            if (range) {
                try {
                    const newRange = document.createRange();
                    newRange.setStart(element.firstChild || element, startOffset);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } catch (e) {
                    // Ignore cursor restoration errors
                }
            }
        }
    },
    
    // ========================================
    // COMMAND MENU
    // ========================================
    
    showCommandMenu(blockId) {
        this.commandMenuActive = true;
        this.commandMenuBlockId = blockId;
        this.commandMenuQuery = '';
        
        const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        
        if (!menu || !blockElement) return;
        
        // Position menu below the block
        const rect = blockElement.getBoundingClientRect();
        menu.style.display = 'block';
        menu.style.top = (rect.bottom + window.scrollY) + 'px';
        menu.style.left = rect.left + 'px';
        
        // Show all items initially
        const items = menu.querySelectorAll('.command-item');
        items.forEach(item => {
            item.style.display = 'flex';
            item.classList.remove('selected');
        });
        
        // Select first visible item
        if (items.length > 0) {
            items[0].classList.add('selected');
        }
        
        // Setup click handlers
        items.forEach(item => {
            item.onclick = () => {
                const command = item.dataset.command;
                this.executeCommand(command, blockId);
                this.hideCommandMenu();
            };
        });
        
        // Setup keyboard navigation
        this.setupMenuKeyboardNavigation();
    },
    
    filterCommandMenu(query) {
        this.commandMenuQuery = query;
        const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
        if (!menu) return;
        
        const items = menu.querySelectorAll('.command-item');
        let firstVisible = null;
        
        items.forEach(item => {
            const command = item.dataset.command.toLowerCase();
            const label = item.textContent.toLowerCase();
            
            // Check if query matches command name or label
            const matches = command.includes(query) || label.includes(query);
            
            item.style.display = matches ? 'flex' : 'none';
            item.classList.remove('selected');
            
            if (matches && !firstVisible) {
                firstVisible = item;
            }
        });
        
        // Select first visible item
        if (firstVisible) {
            firstVisible.classList.add('selected');
        }
    },
    
    setupMenuKeyboardNavigation() {
        // Remove old listener if exists
        if (this.menuKeyboardHandler) {
            document.removeEventListener('keydown', this.menuKeyboardHandler, true);
        }
        
        const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
        if (!menu) return;
        
        this.menuKeyboardHandler = (e) => {
            if (!this.commandMenuActive) {
                document.removeEventListener('keydown', this.menuKeyboardHandler, true);
                this.menuKeyboardHandler = null;
                return;
            }
            
            // Only handle keys if menu is active
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter' && e.key !== 'Escape') {
                return;
            }
            
            const visibleItems = Array.from(menu.querySelectorAll('.command-item'))
                .filter(item => item.style.display !== 'none');
            
            if (visibleItems.length === 0) return;
            
            const currentIndex = visibleItems.findIndex(item => item.classList.contains('selected'));
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (currentIndex >= 0) {
                    visibleItems[currentIndex].classList.remove('selected');
                }
                const nextIndex = (currentIndex + 1) % visibleItems.length;
                visibleItems[nextIndex].classList.add('selected');
                visibleItems[nextIndex].scrollIntoView({ block: 'nearest' });
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (currentIndex >= 0) {
                    visibleItems[currentIndex].classList.remove('selected');
                }
                const prevIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
                visibleItems[prevIndex].classList.add('selected');
                visibleItems[prevIndex].scrollIntoView({ block: 'nearest' });
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (currentIndex >= 0) {
                    visibleItems[currentIndex].click();
                }
                document.removeEventListener('keydown', this.menuKeyboardHandler, true);
                this.menuKeyboardHandler = null;
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.hideCommandMenu();
                document.removeEventListener('keydown', this.menuKeyboardHandler, true);
                this.menuKeyboardHandler = null;
            }
        };
        
        // Use capture phase to catch events before other handlers
        document.addEventListener('keydown', this.menuKeyboardHandler, true);
    },
    
    hideCommandMenu() {
        this.commandMenuActive = false;
        this.commandMenuBlockId = null;
        this.commandMenuQuery = '';
        
        // Remove keyboard handler
        if (this.menuKeyboardHandler) {
            document.removeEventListener('keydown', this.menuKeyboardHandler, true);
            this.menuKeyboardHandler = null;
        }
        
        const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
        if (menu) {
            menu.style.display = 'none';
            // Remove selected class from all items
            menu.querySelectorAll('.command-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
    },
    
    // ========================================
    // TAG MENU (@mention)
    // ========================================
    
    showTagMenu(blockId) {
        console.log('showTagMenu called for blockId:', blockId);
        this.tagMenuActive = true;
        this.tagMenuBlockId = blockId;
        
        // Get all tags from tasks
        const tags = this.getAllTags();
        console.log('Tags found:', tags);
        
        if (tags.length === 0) {
            console.log('No tags available, menu will not show');
            this.tagMenuActive = false;
            return; // No tags to show
        }
        
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!blockElement) {
            console.log('Block element not found');
            return;
        }
        
        // Create or get tag menu
        let menu = document.getElementById(`tagMenu-${this.currentNoteId}`);
        if (!menu) {
            menu = document.createElement('div');
            menu.id = `tagMenu-${this.currentNoteId}`;
            menu.className = 'tag-menu';
            document.body.appendChild(menu);
            console.log('Created new tag menu element');
        }
        
        // Populate menu with tags
        menu.innerHTML = tags.map(tag => `
            <div class="tag-menu-item" data-tag="${tag.tag}">
                <span class="tag-icon">🏷️</span>
                <div class="tag-info">
                    <span class="tag-name">@${tag.tag}</span>
                    <span class="tag-task">${tag.taskTitle}</span>
                </div>
            </div>
        `).join('');
        
        // Position menu below the block
        const rect = blockElement.getBoundingClientRect();
        menu.style.display = 'block';
        menu.style.top = (rect.bottom + window.scrollY) + 'px';
        menu.style.left = rect.left + 'px';
        console.log('Menu positioned at:', menu.style.top, menu.style.left);
        
        // Select first item
        const items = menu.querySelectorAll('.tag-menu-item');
        if (items.length > 0) {
            items[0].classList.add('selected');
        }
        
        // Setup click handlers
        items.forEach(item => {
            item.onclick = () => {
                const tag = item.dataset.tag;
                this.insertTag(tag, blockId);
                this.hideTagMenu();
            };
        });
        
        // Setup keyboard navigation
        this.setupTagMenuKeyboardNavigation();
    },
    
    filterTagMenu(query) {
        const menu = document.getElementById(`tagMenu-${this.currentNoteId}`);
        if (!menu) return;
        
        const items = menu.querySelectorAll('.tag-menu-item');
        let firstVisible = null;
        
        items.forEach(item => {
            const tag = item.dataset.tag.toLowerCase();
            const matches = tag.includes(query);
            
            item.style.display = matches ? 'flex' : 'none';
            item.classList.remove('selected');
            
            if (matches && !firstVisible) {
                firstVisible = item;
            }
        });
        
        // Select first visible item
        if (firstVisible) {
            firstVisible.classList.add('selected');
        }
    },
    
    setupTagMenuKeyboardNavigation() {
        // Remove old listener if exists
        if (this.tagMenuKeyboardHandler) {
            document.removeEventListener('keydown', this.tagMenuKeyboardHandler, true);
        }
        
        const menu = document.getElementById(`tagMenu-${this.currentNoteId}`);
        if (!menu) return;
        
        this.tagMenuKeyboardHandler = (e) => {
            if (!this.tagMenuActive) {
                document.removeEventListener('keydown', this.tagMenuKeyboardHandler, true);
                this.tagMenuKeyboardHandler = null;
                return;
            }
            
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter' && e.key !== 'Escape') {
                return;
            }
            
            const visibleItems = Array.from(menu.querySelectorAll('.tag-menu-item'))
                .filter(item => item.style.display !== 'none');
            
            if (visibleItems.length === 0) return;
            
            const currentIndex = visibleItems.findIndex(item => item.classList.contains('selected'));
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (currentIndex >= 0) {
                    visibleItems[currentIndex].classList.remove('selected');
                }
                const nextIndex = (currentIndex + 1) % visibleItems.length;
                visibleItems[nextIndex].classList.add('selected');
                visibleItems[nextIndex].scrollIntoView({ block: 'nearest' });
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (currentIndex >= 0) {
                    visibleItems[currentIndex].classList.remove('selected');
                }
                const prevIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
                visibleItems[prevIndex].classList.add('selected');
                visibleItems[prevIndex].scrollIntoView({ block: 'nearest' });
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (currentIndex >= 0) {
                    visibleItems[currentIndex].click();
                }
                document.removeEventListener('keydown', this.tagMenuKeyboardHandler, true);
                this.tagMenuKeyboardHandler = null;
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.hideTagMenu();
                document.removeEventListener('keydown', this.tagMenuKeyboardHandler, true);
                this.tagMenuKeyboardHandler = null;
            }
        };
        
        document.addEventListener('keydown', this.tagMenuKeyboardHandler, true);
    },
    
    hideTagMenu() {
        this.tagMenuActive = false;
        this.tagMenuBlockId = null;
        
        if (this.tagMenuKeyboardHandler) {
            document.removeEventListener('keydown', this.tagMenuKeyboardHandler, true);
            this.tagMenuKeyboardHandler = null;
        }
        
        const menu = document.getElementById(`tagMenu-${this.currentNoteId}`);
        if (menu) {
            menu.style.display = 'none';
        }
    },
    
    getAllTags() {
        console.log('getAllTags called');
        
        // Try to get tasks from DataStore first
        let tasks = [];
        if (typeof DataStore !== 'undefined' && DataStore.getTasks) {
            tasks = DataStore.getTasks();
            console.log('Got tasks from DataStore:', tasks);
        } else {
            // Fallback to localStorage
            const tasksJson = localStorage.getItem('tasks');
            console.log('localStorage tasks:', tasksJson);
            
            if (!tasksJson) {
                console.log('No tasks in localStorage');
                return [];
            }
            
            try {
                const data = JSON.parse(tasksJson);
                tasks = data.tasks || [];
                console.log('Parsed tasks from localStorage:', tasks);
            } catch (e) {
                console.error('Error parsing tasks for tags:', e);
                return [];
            }
        }
        
        // Filter tasks with tags and return tag info
        const tagsWithInfo = tasks
            .filter(t => {
                const hasTag = t.tag && t.tag.trim();
                if (hasTag) {
                    console.log('Found task with tag:', t.tag, t.title);
                }
                return hasTag;
            })
            .map(t => ({
                tag: t.tag.trim(),
                taskTitle: t.title,
                taskId: t.id
            }));
        
        console.log('Returning tags:', tagsWithInfo);
        return tagsWithInfo;
    },
    
    insertTag(tag, blockId) {
        console.log('insertTag called with tag:', tag, 'blockId:', blockId);
        const element = document.querySelector(`[data-block-id="${blockId}"] .block-content`);
        if (!element) {
            console.log('Element not found');
            return;
        }
        
        // Get current selection to find where the @ was typed
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        // Find the @ symbol before the cursor in the text node
        if (textNode.nodeType === Node.TEXT_NODE) {
            const textContent = textNode.textContent;
            const cursorPos = range.startOffset;
            const textBeforeCursor = textContent.substring(0, cursorPos);
            const match = textBeforeCursor.match(/@\w*$/);
            
            if (match) {
                const matchStart = cursorPos - match[0].length;
                
                // Create the tag link element
                const tagLink = document.createElement('a');
                tagLink.href = '#';
                tagLink.className = 'tag-link';
                tagLink.setAttribute('data-tag', tag);
                
                // Add click event listener
                tagLink.addEventListener('click', (e) => {
                    console.log('Tag link clicked:', tag);
                    e.preventDefault();
                    e.stopPropagation();
                    BlockEditor.navigateToTag(tag);
                });
                
                tagLink.textContent = `@${tag}`;
                
                // Split the text node at the match position
                const beforeText = textContent.substring(0, matchStart);
                const afterText = textContent.substring(cursorPos);
                
                // Replace the text node with: beforeText + tagLink + space + afterText
                const parent = textNode.parentNode;
                const beforeNode = document.createTextNode(beforeText);
                const spaceNode = document.createTextNode(' ');
                const afterNode = document.createTextNode(afterText);
                
                parent.insertBefore(beforeNode, textNode);
                parent.insertBefore(tagLink, textNode);
                parent.insertBefore(spaceNode, textNode);
                parent.insertBefore(afterNode, textNode);
                parent.removeChild(textNode);
                
                // Place cursor after the space
                const newRange = document.createRange();
                newRange.setStartAfter(spaceNode);
                newRange.setEndAfter(spaceNode);
                selection.removeAllRanges();
                selection.addRange(newRange);
                
                console.log('Tag inserted and converted to link');
            }
        }
        
        // Save the block
        this.updateBlockContent(blockId);
    },
    
    executeCommand(command, blockId) {
        // Clear the slash command text
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            const contentElement = blockElement.querySelector('[contenteditable]');
            if (contentElement && contentElement.textContent.startsWith('/')) {
                contentElement.textContent = '';
            }
        }
        
        const typeMap = {
            'text': 'paragraph',
            'h1': 'h1',
            'h2': 'h2',
            'h3': 'h3',
            'bullet': 'bullet',
            'number': 'number',
            'todo': 'todo',
            'code': 'code',
            'quote': 'quote',
            'divider': 'divider',
            'callout': 'callout',
            'toggle': 'toggle',
            'image': 'image'
        };
        
        const newType = typeMap[command];
        if (newType) {
            this.convertBlockType(blockId, newType);
        }
    },
    
    // ========================================
    // BLOCK OPERATIONS
    // ========================================
    
    convertBlockType(blockId, newType, newContent = null) {
        const note = this.loadNote(this.currentNoteId);
        const blockIndex = note.blocks.findIndex(b => b.id === blockId);
        
        if (blockIndex === -1) return;
        
        const block = note.blocks[blockIndex];
        const element = document.querySelector(`[data-block-id="${blockId}"] .block-content`);
        
        block.type = newType;
        if (newContent !== null) {
            block.content = newContent;
        } else if (element) {
            block.content = element.innerHTML;
        }
        
        this.saveNote(note);
        this.refreshEditor();
        
        // Focus the converted block
        setTimeout(() => {
            const newElement = document.querySelector(`[data-block-id="${blockId}"] .block-content`);
            if (newElement) {
                newElement.focus();
                this.setCursorToEnd(newElement);
            }
        }, 50);
    },
    
    createNewBlockAfter(blockId) {
        const note = this.loadNote(this.currentNoteId);
        const blockIndex = note.blocks.findIndex(b => b.id === blockId);
        
        if (blockIndex === -1) return;
        
        const newBlock = this.createBlock('paragraph');
        note.blocks.splice(blockIndex + 1, 0, newBlock);
        
        this.saveNote(note);
        this.refreshEditor();
        
        // Focus new block
        setTimeout(() => {
            const newElement = document.querySelector(`[data-block-id="${newBlock.id}"] .block-content`);
            if (newElement) newElement.focus();
        }, 50);
    },
    
    deleteBlock(blockId) {
        const note = this.loadNote(this.currentNoteId);
        const blockIndex = note.blocks.findIndex(b => b.id === blockId);
        
        if (blockIndex === -1 || note.blocks.length === 1) return;
        
        // Focus previous block before deleting
        const prevBlock = note.blocks[blockIndex - 1];
        
        note.blocks.splice(blockIndex, 1);
        this.saveNote(note);
        this.refreshEditor();
        
        // Focus previous block
        if (prevBlock) {
            setTimeout(() => {
                const prevElement = document.querySelector(`[data-block-id="${prevBlock.id}"] .block-content`);
                if (prevElement) {
                    prevElement.focus();
                    this.setCursorToEnd(prevElement);
                }
            }, 50);
        }
    },
    
    addBlock(type = 'paragraph') {
        const note = this.loadNote(this.currentNoteId);
        const newBlock = this.createBlock(type);
        note.blocks.push(newBlock);
        
        this.saveNote(note);
        this.refreshEditor();
        
        setTimeout(() => {
            const newElement = document.querySelector(`[data-block-id="${newBlock.id}"] .block-content`);
            if (newElement) newElement.focus();
        }, 50);
    },
    
    updateBlockContent(blockId) {
        const note = this.loadNote(this.currentNoteId);
        const block = note.blocks.find(b => b.id === blockId);
        
        if (!block) return;
        
        const element = document.querySelector(`[data-block-id="${blockId}"] .block-content`);
        if (element) {
            block.content = element.innerHTML;
            this.saveNote(note, false); // Don't refresh on content update
        }
    },
    
    toggleTodo(blockId, checked) {
        const note = this.loadNote(this.currentNoteId);
        const block = note.blocks.find(b => b.id === blockId);
        
        if (!block) return;
        
        block.properties.checked = checked;
        this.saveNote(note);
    },
    
    setCodeLanguage(blockId, language) {
        const note = this.loadNote(this.currentNoteId);
        const block = note.blocks.find(b => b.id === blockId);
        
        if (!block) return;
        
        block.properties.language = language;
        this.saveNote(note, false);
    },
    
    copyCode(blockId) {
        const element = document.querySelector(`[data-block-id="${blockId}"] .code-content`);
        if (!element) return;
        
        const text = element.textContent;
        navigator.clipboard.writeText(text).then(() => {
            UI.showToast('Code copied!', 'success');
        });
    },
    
    indentBlock(blockId, indent) {
        // TODO: Implement nested list indentation
        console.log('Indent block:', blockId, indent);
    },
    
    getBlock(blockId) {
        const note = this.loadNote(this.currentNoteId);
        return note.blocks.find(b => b.id === blockId);
    },
    
    // ========================================
    // STORAGE & PERSISTENCE
    // ========================================
    
    createNewNote(noteId, projectId) {
        return {
            id: noteId,
            projectId: projectId,
            paperId: null,
            taskId: null,
            title: '',
            blocks: [this.createBlock('paragraph')],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags: [],
            status: 'draft'
        };
    },
    
    loadNote(noteId) {
        // Use noteId directly if it already has 'note_' prefix, otherwise add it
        const key = noteId.startsWith('note_') ? noteId : `note_${noteId}`;
        const data = localStorage.getItem(key);
        
        if (data) {
            return JSON.parse(data);
        }
        
        return null;
    },
    
    saveNote(note = null, refresh = false) {
        if (!note) {
            note = this.loadNote(this.currentNoteId);
        }
        
        if (!note) return;
        
        note.updatedAt = new Date().toISOString();
        
        // Use note.id directly if it already has 'note_' prefix, otherwise add it
        const key = note.id.startsWith('note_') ? note.id : `note_${note.id}`;
        localStorage.setItem(key, JSON.stringify(note));
        
        // Update last saved time
        const lastSavedElement = document.getElementById(`lastSaved-${note.id}`);
        if (lastSavedElement) {
            lastSavedElement.textContent = 'Just now';
        }
        
        if (refresh) {
            this.refreshEditor();
        }
    },
    
    updateTitle(noteId, title) {
        const note = this.loadNote(noteId);
        if (note) {
            note.title = title;
            this.saveNote(note);
        }
    },
    
    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            if (this.currentNoteId) {
                this.saveNote();
            }
        }, 30000); // Auto-save every 30 seconds
    },
    
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
    },
    
    // ========================================
    // EXPORT
    // ========================================
    
    exportToMarkdown(noteId) {
        const note = this.loadNote(noteId);
        if (!note) return;
        
        let markdown = `# ${note.title || 'Untitled'}\n\n`;
        
        note.blocks.forEach(block => {
            const plainText = this.stripHtml(block.content);
            
            switch (block.type) {
                case 'h1':
                    markdown += `# ${plainText}\n\n`;
                    break;
                case 'h2':
                    markdown += `## ${plainText}\n\n`;
                    break;
                case 'h3':
                    markdown += `### ${plainText}\n\n`;
                    break;
                case 'bullet':
                    markdown += `- ${plainText}\n`;
                    break;
                case 'number':
                    markdown += `1. ${plainText}\n`;
                    break;
                case 'todo':
                    const checked = block.properties.checked ? 'x' : ' ';
                    markdown += `- [${checked}] ${plainText}\n`;
                    break;
                case 'code':
                    const lang = block.properties.language || '';
                    markdown += `\`\`\`${lang}\n${plainText}\n\`\`\`\n\n`;
                    break;
                case 'quote':
                    markdown += `> ${plainText}\n\n`;
                    break;
                case 'divider':
                    markdown += `---\n\n`;
                    break;
                default:
                    markdown += `${plainText}\n\n`;
            }
        });
        
        // Download as file
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title || 'note'}.md`;
        a.click();
        URL.revokeObjectURL(url);
        
        UI.showToast('Exported to Markdown!', 'success');
    },
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    refreshEditor() {
        const note = this.loadNote(this.currentNoteId);
        if (!note) return;
        
        const container = document.getElementById(`blocksContainer-${this.currentNoteId}`);
        if (container) {
            container.innerHTML = note.blocks.map((block, index) => 
                this.renderBlock(block, index)
            ).join('');
        }
    },
    
    setCursorToEnd(element) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    },
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.isProcessingHistory = true;
            this.restoreFromHistory();
            this.isProcessingHistory = false;
            UI.showToast('Undo', 'info');
        }
    },
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.isProcessingHistory = true;
            this.restoreFromHistory();
            this.isProcessingHistory = false;
            UI.showToast('Redo', 'info');
        }
    },
    
    saveHistory() {
        if (this.isProcessingHistory) return;
        
        const note = this.loadNote(this.currentNoteId);
        if (!note) return;
        
        // Remove any history after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add current state
        this.history.push(JSON.parse(JSON.stringify(note)));
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    },
    
    restoreFromHistory() {
        if (this.historyIndex < 0 || this.historyIndex >= this.history.length) return;
        
        const state = this.history[this.historyIndex];
        this.saveNote(state, true);
    },
    
    // ========================================
    // NAVIGATION HELPERS
    // ========================================
    
    isAtStart(element) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        const range = selection.getRangeAt(0);
        return range.startOffset === 0 && range.collapsed;
    },
    
    isAtEnd(element) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        const range = selection.getRangeAt(0);
        const text = element.textContent || '';
        return range.endOffset === text.length && range.collapsed;
    },
    
    focusPreviousBlock(currentBlockId) {
        const note = this.loadNote(this.currentNoteId);
        const currentIndex = note.blocks.findIndex(b => b.id === currentBlockId);
        
        if (currentIndex > 0) {
            const prevBlock = note.blocks[currentIndex - 1];
            const prevElement = document.querySelector(`[data-block-id="${prevBlock.id}"] .block-content`);
            if (prevElement) {
                prevElement.focus();
                this.setCursorToEnd(prevElement);
            }
        }
    },
    
    focusNextBlock(currentBlockId) {
        const note = this.loadNote(this.currentNoteId);
        const currentIndex = note.blocks.findIndex(b => b.id === currentBlockId);
        
        if (currentIndex < note.blocks.length - 1) {
            const nextBlock = note.blocks[currentIndex + 1];
            const nextElement = document.querySelector(`[data-block-id="${nextBlock.id}"] .block-content`);
            if (nextElement) {
                nextElement.focus();
                // Set cursor to start
                const range = document.createRange();
                const selection = window.getSelection();
                range.setStart(nextElement, 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    },
    
    // ========================================
    // IMAGE BLOCK FUNCTIONS
    // ========================================
    
    uploadImage(blockId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const note = this.loadNote(this.currentNoteId);
                const block = note.blocks.find(b => b.id === blockId);
                if (!block) return;
                
                block.properties.url = event.target.result;
                this.saveNote(note, true);
                this.saveHistory();
                UI.showToast('Image uploaded', 'success');
            };
            
            reader.readAsDataURL(file);
        };
        
        input.click();
    },
    
    changeImageUrl(blockId) {
        const url = prompt('Enter image URL:');
        if (!url) return;
        
        const note = this.loadNote(this.currentNoteId);
        const block = note.blocks.find(b => b.id === blockId);
        if (!block) return;
        
        block.properties.url = url;
        this.saveNote(note, true);
        this.saveHistory();
    },
    
    setImageWidth(blockId) {
        const width = prompt('Enter width (e.g., 100%, 500px, 50%):', '100%');
        if (!width) return;
        
        const note = this.loadNote(this.currentNoteId);
        const block = note.blocks.find(b => b.id === blockId);
        if (!block) return;
        
        block.properties.width = width;
        this.saveNote(note, true);
    },
    
    updateImageCaption(blockId) {
        const element = document.querySelector(`[data-block-id="${blockId}"] .image-caption`);
        if (!element) return;
        
        const note = this.loadNote(this.currentNoteId);
        const block = note.blocks.find(b => b.id === blockId);
        if (!block) return;
        
        block.properties.caption = element.textContent;
        this.saveNote(note, false);
    },
    
    // ========================================
    // TAG LINKS - @tag functionality
    // ========================================
    
    convertTagsToLinks(element) {
        if (!element) return;
        
        const html = element.innerHTML;
        // Match @word patterns that aren't already inside <a> tags
        const tagPattern = /(?<!<a[^>]*>)@(\w+)(?![^<]*<\/a>)/g;
        
        let newHtml = html;
        let match;
        const matches = [];
        
        // Find all @tag occurrences
        while ((match = tagPattern.exec(html)) !== null) {
            matches.push({ full: match[0], tag: match[1], index: match.index });
        }
        
        // Replace from end to start to maintain indices
        for (let i = matches.length - 1; i >= 0; i--) {
            const m = matches[i];
            const before = newHtml.substring(0, m.index);
            const after = newHtml.substring(m.index + m.full.length);
            newHtml = before + `<a href="#" class="tag-link" data-tag="${m.tag}" onclick="BlockEditor.navigateToTag('${m.tag}'); return false;">@${m.tag}</a>` + after;
        }
        
        if (newHtml !== html) {
            // Save cursor position
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            
            element.innerHTML = newHtml;
            
            // Try to restore cursor
            if (range) {
                try {
                    selection.removeAllRanges();
                    selection.addRange(range);
                } catch (e) {
                    // If restoration fails, just place cursor at end
                    this.setCursorToEnd(element);
                }
            }
        }
    },
    
    navigateToTag(tag) {
        console.log('Navigating to tag:', tag);
        
        // Get tasks from DataStore first
        let tasks = [];
        if (typeof DataStore !== 'undefined' && DataStore.getTasks) {
            tasks = DataStore.getTasks();
            console.log('Got tasks from DataStore for navigation:', tasks);
        } else {
            // Fallback to localStorage
            const tasksJson = localStorage.getItem('tasks');
            if (!tasksJson) {
                console.log('No tasks in localStorage');
                UI.showToast('No tasks found', 'info');
                return;
            }
            
            try {
                const data = JSON.parse(tasksJson);
                tasks = data.tasks || [];
                console.log('Got tasks from localStorage:', tasks);
            } catch (e) {
                console.error('Error parsing tasks:', e);
                return;
            }
        }
        
        console.log('Searching for tag:', tag);
        console.log('Available tasks:', tasks.map(t => ({ id: t.id, title: t.title, tag: t.tag })));
        
        // Find task with matching tag
        const task = tasks.find(t => {
            const hasMatch = t.tag && t.tag.toLowerCase().trim() === tag.toLowerCase().trim();
            console.log(`Checking task ${t.id} (${t.title}): tag="${t.tag}" matches="${hasMatch}"`);
            return hasMatch;
        });
        
        if (!task) {
            console.log('No task found with tag:', tag);
            UI.showToast(`No task found with tag: @${tag}`, 'info');
            return;
        }
        
        console.log('Found task:', task);
        
        // Navigate to task note
        if (typeof ProjectsView !== 'undefined' && ProjectsView.openTaskNote) {
            ProjectsView.openTaskNote(task.projectId, task.id, task.title);
            UI.showToast(`Opening note for: ${task.title}`, 'success');
        } else {
            console.error('ProjectsView.openTaskNote not available');
        }
    },
    
    setupEventListeners() {
        // Handle tag link clicks using event delegation
        document.addEventListener('click', (e) => {
            // Check if clicked element is a tag link or inside a tag link
            const tagLink = e.target.closest('.tag-link');
            if (tagLink && tagLink.hasAttribute('data-tag')) {
                console.log('Tag link clicked via delegation:', tagLink.getAttribute('data-tag'));
                e.preventDefault();
                e.stopPropagation();
                const tag = tagLink.getAttribute('data-tag');
                this.navigateToTag(tag);
                return;
            }
            
            // Close command menu on outside click
            if (this.commandMenuActive) {
                const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
                if (menu && !menu.contains(e.target)) {
                    this.hideCommandMenu();
                }
            }
            
            // Close tag menu on outside click
            if (this.tagMenuActive) {
                const tagMenu = document.getElementById(`tagMenu-${this.currentNoteId}`);
                if (tagMenu && !tagMenu.contains(e.target)) {
                    this.hideTagMenu();
                }
            }
        });
    }
};
