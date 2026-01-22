// ================================================
// ENHANCED BLOCK EDITOR - NOTION-LIKE FEATURES
// ================================================
// Additional features for Block Editor:
// - Selection toolbar with formatting
// - Drag & drop blocks
// - Block actions menu
// - Callout and Toggle blocks
// - Full keyboard shortcuts

// Add these methods to BlockEditor object:

// ========================================
// SELECTION TOOLBAR
// ========================================

BlockEditor.handleTextSelection = function(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        this.showSelectionToolbar(rect);
    } else {
        this.hideSelectionToolbar();
    }
};

BlockEditor.showSelectionToolbar = function(rect) {
    const toolbar = document.getElementById(`selectionToolbar-${this.currentNoteId}`);
    if (!toolbar) return;
    
    this.selectionToolbarVisible = true;
    toolbar.style.display = 'flex';
    toolbar.style.top = (rect.top + window.scrollY - 45) + 'px';
    toolbar.style.left = (rect.left + rect.width / 2) + 'px';
};

BlockEditor.hideSelectionToolbar = function() {
    const toolbar = document.getElementById(`selectionToolbar-${this.currentNoteId}`);
    if (toolbar) {
        this.selectionToolbarVisible = false;
        toolbar.style.display = 'none';
    }
};

BlockEditor.formatSelection = function(format) {
    const formatMap = {
        'bold': 'bold',
        'italic': 'italic',
        'underline': 'underline',
        'strikethrough': 'strikeThrough',
        'code': 'insertHTML'
    };
    
    if (format === 'code') {
        const selection = window.getSelection();
        const text = selection.toString();
        document.execCommand('insertHTML', false, `<code>${text}</code>`);
    } else {
        document.execCommand(formatMap[format]);
    }
    
    this.saveNote();
};

BlockEditor.insertLink = function() {
    const url = prompt('Enter URL:');
    if (url) {
        document.execCommand('createLink', false, url);
        this.saveNote();
    }
};

BlockEditor.showColorPicker = function() {
    const picker = document.getElementById(`colorPicker-${this.currentNoteId}`);
    if (!picker) return;
    
    // Position picker below selection toolbar
    const toolbar = document.getElementById(`selectionToolbar-${this.currentNoteId}`);
    if (toolbar) {
        const rect = toolbar.getBoundingClientRect();
        picker.style.display = 'block';
        picker.style.top = (rect.bottom + window.scrollY + 5) + 'px';
        picker.style.left = rect.left + 'px';
    }
    
    // Setup click handlers for color swatches
    const swatches = picker.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
        swatch.onclick = (e) => {
            e.stopPropagation();
            const color = swatch.dataset.color;
            document.execCommand('foreColor', false, color);
            this.hideColorPicker();
            this.hideSelectionToolbar();
            this.saveNote();
        };
    });
    
    // Close on outside click
    const closeHandler = (e) => {
        if (!picker.contains(e.target)) {
            this.hideColorPicker();
            document.removeEventListener('click', closeHandler);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeHandler);
    }, 0);
};

BlockEditor.hideColorPicker = function() {
    const picker = document.getElementById(`colorPicker-${this.currentNoteId}`);
    if (picker) {
        picker.style.display = 'none';
    }
};

// ========================================
// DRAG & DROP
// ========================================

BlockEditor.handleDragStart = function(event, blockId) {
    this.draggedBlockId = blockId;
    event.dataTransfer.effectAllowed = 'move';
    event.target.closest('.block').style.opacity = '0.4';
};

BlockEditor.handleDragEnd = function(event) {
    event.target.closest('.block').style.opacity = '1';
    this.draggedBlockId = null;
    
    // Remove all drop indicators
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
};

BlockEditor.handleDragOver = function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const block = event.currentTarget;
    const rect = block.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    // Remove existing indicators
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    
    // Add indicator
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    
    if (event.clientY < midpoint) {
        block.parentNode.insertBefore(indicator, block);
    } else {
        block.parentNode.insertBefore(indicator, block.nextSibling);
    }
};

BlockEditor.handleDrop = function(event, targetBlockId) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.draggedBlockId || this.draggedBlockId === targetBlockId) return;
    
    const note = this.loadNote(this.currentNoteId);
    const draggedIndex = note.blocks.findIndex(b => b.id === this.draggedBlockId);
    const targetIndex = note.blocks.findIndex(b => b.id === targetBlockId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Determine if dropping above or below
    const block = event.currentTarget;
    const rect = block.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const insertIndex = event.clientY < midpoint ? targetIndex : targetIndex + 1;
    
    // Reorder blocks
    const [draggedBlock] = note.blocks.splice(draggedIndex, 1);
    const newTargetIndex = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
    note.blocks.splice(newTargetIndex, 0, draggedBlock);
    
    this.saveNote(note, true);
    
    // Remove indicators
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
};

// ========================================
// BLOCK ACTIONS MENU
// ========================================

BlockEditor.showBlockMenu = function(event, blockId) {
    event.stopPropagation();
    
    // Create menu if not exists
    let menu = document.getElementById('blockActionsMenu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'blockActionsMenu';
        menu.className = 'block-actions-menu';
        menu.innerHTML = `
            <div class="menu-item" onclick="BlockEditor.duplicateBlock()">
                <span class="menu-icon">📋</span>
                <span>Duplicate</span>
            </div>
            <div class="menu-item" onclick="BlockEditor.copyBlockToClipboard()">
                <span class="menu-icon">📄</span>
                <span>Copy</span>
            </div>
            <div class="menu-item menu-item-danger" onclick="BlockEditor.deleteCurrentBlock()">
                <span class="menu-icon">🗑️</span>
                <span>Delete</span>
            </div>
        `;
        document.body.appendChild(menu);
    }
    
    // Store current block ID
    menu.dataset.blockId = blockId;
    
    // Position menu
    const rect = event.target.getBoundingClientRect();
    menu.style.display = 'block';
    menu.style.top = (rect.bottom + window.scrollY) + 'px';
    menu.style.left = rect.left + 'px';
    
    // Close on outside click
    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
};

BlockEditor.duplicateBlock = function() {
    const menu = document.getElementById('blockActionsMenu');
    const blockId = menu?.dataset.blockId;
    if (!blockId) return;
    
    const note = this.loadNote(this.currentNoteId);
    const blockIndex = note.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;
    
    const originalBlock = note.blocks[blockIndex];
    const duplicatedBlock = {
        ...originalBlock,
        id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now()
    };
    
    note.blocks.splice(blockIndex + 1, 0, duplicatedBlock);
    this.saveNote(note, true);
    
    menu.style.display = 'none';
    UI.showToast('Block duplicated', 'success');
};

BlockEditor.copyBlockToClipboard = function() {
    const menu = document.getElementById('blockActionsMenu');
    const blockId = menu?.dataset.blockId;
    if (!blockId) return;
    
    const block = this.getBlock(blockId);
    if (!block) return;
    
    const text = this.stripHtml(block.content);
    navigator.clipboard.writeText(text).then(() => {
        UI.showToast('Copied to clipboard', 'success');
    });
    
    menu.style.display = 'none';
};

BlockEditor.deleteCurrentBlock = function() {
    const menu = document.getElementById('blockActionsMenu');
    const blockId = menu?.dataset.blockId;
    if (!blockId) return;
    
    this.deleteBlock(blockId);
    menu.style.display = 'none';
};

// ========================================
// SPECIAL BLOCKS
// ========================================

BlockEditor.toggleCollapse = function(blockId) {
    const note = this.loadNote(this.currentNoteId);
    const block = note.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    block.properties.isOpen = !block.properties.isOpen;
    this.saveNote(note, true);
};

BlockEditor.changeEmoji = function(blockId) {
    const emoji = prompt('Enter emoji:', '💡');
    if (!emoji) return;
    
    const note = this.loadNote(this.currentNoteId);
    const block = note.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    block.properties.emoji = emoji;
    this.saveNote(note, true);
};

// ========================================
// ENHANCED EVENT LISTENERS
// ========================================

// Store original setupEventListeners
const _originalSetupEventListeners = BlockEditor.setupEventListeners.bind(BlockEditor);

// Override setupEventListeners to include new features
BlockEditor.setupEventListeners = function() {
    // Call original
    _originalSetupEventListeners();
    
    // Add selection toolbar listeners
    document.addEventListener('mouseup', (e) => {
        setTimeout(() => this.handleTextSelection(e), 10);
    });
    
    document.addEventListener('keyup', (e) => {
        setTimeout(() => this.handleTextSelection(e), 10);
    });
};

// Initialize enhanced features immediately
if (typeof BlockEditor !== 'undefined') {
    console.log('✅ Block Editor Enhanced features loaded');
    console.log('✅ Available methods:', Object.keys(BlockEditor).filter(k => typeof BlockEditor[k] === 'function').slice(0, 10));
}
