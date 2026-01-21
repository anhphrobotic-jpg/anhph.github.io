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
                    <span class="footer-hint">Press '/' for commands</span>
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
                            data-placeholder="Type '/' for commands"
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
        
        // Slash command
        if (event.key === '/' && content === '') {
            event.preventDefault();
            this.showCommandMenu(blockId);
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
        const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        
        if (!menu || !blockElement) return;
        
        // Position menu below the block
        const rect = blockElement.getBoundingClientRect();
        menu.style.display = 'block';
        menu.style.top = (rect.bottom + window.scrollY) + 'px';
        menu.style.left = rect.left + 'px';
        
        // Setup click handlers
        const items = menu.querySelectorAll('.command-item');
        items.forEach(item => {
            item.onclick = () => {
                const command = item.dataset.command;
                this.executeCommand(command, blockId);
                this.hideCommandMenu();
            };
        });
        
        // Setup keyboard navigation
        let selectedIndex = 0;
        items[selectedIndex].classList.add('selected');
        
        const handleMenuKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                items[selectedIndex].classList.remove('selected');
                selectedIndex = (selectedIndex + 1) % items.length;
                items[selectedIndex].classList.add('selected');
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                items[selectedIndex].classList.remove('selected');
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                items[selectedIndex].classList.add('selected');
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                items[selectedIndex].click();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                this.hideCommandMenu();
            }
        };
        
        document.addEventListener('keydown', handleMenuKeyDown, { once: true });
    },
    
    hideCommandMenu() {
        this.commandMenuActive = false;
        const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
        if (menu) {
            menu.style.display = 'none';
        }
    },
    
    executeCommand(command, blockId) {
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
        const key = `note_${noteId}`;
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
        
        note.updatedAt = Date.now();
        
        const key = `note_${note.id}`;
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
    
    setupEventListeners() {
        // Close command menu on outside click
        document.addEventListener('click', (e) => {
            if (this.commandMenuActive) {
                const menu = document.getElementById(`commandMenu-${this.currentNoteId}`);
                if (menu && !menu.contains(e.target)) {
                    this.hideCommandMenu();
                }
            }
        });
    }
};
