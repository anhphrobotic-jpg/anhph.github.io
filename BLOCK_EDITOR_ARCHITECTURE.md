# NOTION-LIKE BLOCK EDITOR - TECHNICAL ARCHITECTURE

## A. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  - Project Page → Research Notes Section                    │
│  - Toggle to show/hide editor                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Block Editor Controller                        │
│  (js/components/blockEditor.js)                            │
│                                                             │
│  - init() / destroy()                                       │
│  - renderEditor()                                           │
│  - Event coordination                                       │
│  - State management                                         │
└─────────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│Block Manager│    │  Command Menu    │    │  Keyboard       │
│- Create     │    │  - Slash /       │    │  - Enter        │
│- Update     │    │  - Type convert  │    │  - Backspace    │
│- Delete     │    │  - Quick insert  │    │  - Tab/Shift+Tab│
│- Convert    │    │  - Navigation    │    │  - Ctrl+Z/Y     │
└─────────────┘    └──────────────────┘    └─────────────────┘
        ↓                                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Storage Service (localStorage)                  │
│  - Auto-save (every 30s)                                    │
│  - Manual save (Ctrl+S)                                     │
│  - JSON serialize/deserialize                               │
│  - Version timestamps                                       │
└─────────────────────────────────────────────────────────────┘
```

## B. DATA MODEL

### Note Structure
```json
{
  "id": "note_project_proj_1",
  "projectId": "proj_1",
  "paperId": null,
  "taskId": null,
  "title": "AI Model Architecture Notes",
  "blocks": [Block],
  "createdAt": 1737465600000,
  "updatedAt": 1737552000000,
  "tags": ["architecture", "deep-learning"],
  "status": "active"
}
```

### Block Structure
```json
{
  "id": "block_1737465600123_abc123",
  "type": "paragraph|h1|h2|h3|bullet|number|todo|code|quote|divider",
  "content": "HTML string with inline formatting",
  "properties": {
    "checked": false,        // for todo blocks
    "language": "javascript", // for code blocks
    "level": 0,              // for list indentation
    "url": "",               // for embeds/images
    "caption": ""            // for media blocks
  },
  "createdAt": 1737465600123
}
```

## C. BLOCK TYPES SPECIFICATION

### 1. Text Blocks
- **paragraph**: Default block type, plain text with inline formatting
- **h1, h2, h3**: Headings with different sizes
- **quote**: Blockquote with left border styling

### 2. List Blocks
- **bullet**: Unordered list with • marker
- **number**: Ordered list with numeric markers
- **todo**: Checklist with checkbox state

### 3. Special Blocks
- **code**: Monospace block with language selection
- **divider**: Horizontal line separator

### 4. Properties
Each block can have:
- `checked` (boolean): For todo blocks
- `language` (string): For code blocks
- `level` (number): For nested lists
- `url` (string): For media embeds
- `caption` (string): For media descriptions

## D. EDITOR FEATURES

### 1. Slash Commands
Typing `/` at the start of a block opens command menu:
- `/text` → paragraph
- `/h1`, `/h2`, `/h3` → headings
- `/bullet` → bullet list
- `/number` → numbered list
- `/todo` → checklist
- `/code` → code block
- `/quote` → quote block
- `/divider` → horizontal line

### 2. Markdown Shortcuts
- `#` + space → H1
- `##` + space → H2
- `###` + space → H3
- `-` or `*` + space → Bullet list
- `1.` + space → Numbered list
- `[ ]` + space → Todo list
- ` ``` ` → Code block
- `>` + space → Quote
- `---` → Divider

### 3. Keyboard Shortcuts

**Navigation:**
- Enter → Create new block below
- Backspace (on empty) → Delete block
- Arrow Up/Down → Move between blocks

**List Operations:**
- Tab → Indent list item
- Shift+Tab → Unindent list item

**Formatting:**
- Ctrl/Cmd+B → Bold
- Ctrl/Cmd+I → Italic
- Ctrl/Cmd+S → Save note

**History:**
- Ctrl/Cmd+Z → Undo (planned)
- Ctrl/Cmd+Shift+Z → Redo (planned)

### 4. Inline Formatting
Supports HTML contenteditable with:
- **Bold** (Ctrl+B)
- *Italic* (Ctrl+I)
- Underline
- Inline `code`

### 5. Auto-Save
- Saves automatically every 30 seconds
- Manual save with Ctrl+S
- Updates "Last saved" timestamp
- No data loss on navigation

## E. USER EXPERIENCE FLOW

### Creating a Note
1. Navigate to Projects → Select a project
2. Click "Show Notes" button
3. Editor initializes with one empty paragraph block
4. Start typing or press `/` for commands

### Editing Workflow
1. Type `/` → Select block type
2. Start typing content
3. Press Enter → New block created
4. Content auto-saves every 30s
5. Export to Markdown available

### Block Manipulation
- **Hover** → Shows drag handle (⋮⋮)
- **Click handle** → Drag to reorder (planned)
- **Click content** → Edit inline
- **Backspace empty** → Delete block

## F. TECHNICAL IMPLEMENTATION

### Core Files
```
js/components/blockEditor.js   - Main editor logic (700+ lines)
css/main.css                   - Block editor styles
index.html                     - Script include
js/views/projects.js           - Integration point
```

### Key Functions

**Initialization:**
```javascript
BlockEditor.init(noteId)          // Initialize editor
BlockEditor.destroy()              // Cleanup on unmount
```

**Block Operations:**
```javascript
createBlock(type, content)         // Create new block
renderBlock(block, index)          // Render block HTML
convertBlockType(id, newType)      // Convert block type
updateBlockContent(id)             // Update on edit
deleteBlock(id)                    // Remove block
```

**Command System:**
```javascript
showCommandMenu(blockId)           // Display / menu
executeCommand(command, blockId)   // Execute selected command
checkMarkdownShortcuts(blockId)    // Parse markdown
```

**Storage:**
```javascript
loadNote(noteId)                   // Load from localStorage
saveNote(note)                     // Save to localStorage
exportToMarkdown(noteId)           // Export as .md file
```

## G. INTEGRATION WITH EXISTING SYSTEM

### Project View Integration
```javascript
// In projects.js
renderNotesSection(projectId) {
    const noteId = `note_project_${projectId}`;
    return BlockEditor.renderEditor(noteId, projectId);
}

toggleNotes(projectId) {
    // Show/hide notes section
    // Initialize BlockEditor when shown
}
```

### Data Storage
- Notes stored in `localStorage` with key: `note_${noteId}`
- Separate from project/task/paper data
- Can be synced to backend later

### Linking System (Planned)
- Link notes to projects: `noteId = "note_project_{projectId}"`
- Link notes to papers: `noteId = "note_paper_{paperId}"`
- Link notes to tasks: `noteId = "note_task_{taskId}"`

## H. FUTURE EXTENSIONS

### Phase 2 - Advanced Features
- [ ] Block drag & drop reordering
- [ ] Nested blocks (toggles/collapsible)
- [ ] Table blocks
- [ ] Image/media upload and embed
- [ ] LaTeX equation blocks (KaTeX integration)
- [ ] Wiki-style links [[Note Name]]
- [ ] Backlinks panel
- [ ] Tags and mentions (@, #)

### Phase 3 - Collaboration
- [ ] Real-time collaboration
- [ ] Comments on blocks
- [ ] Version history UI
- [ ] Share links

### Phase 4 - AI Integration
- [ ] AI writing assistant
- [ ] Auto-summarization
- [ ] Smart suggestions
- [ ] Citation auto-complete

### Phase 5 - Handwritten Notes
- [ ] PDF embed blocks
- [ ] Image blocks with annotations
- [ ] Link handwritten notes to typed text
- [ ] OCR for searchable handwriting

## I. EXAMPLE JSON

### Complete Note Example
```json
{
  "id": "note_project_proj_1",
  "projectId": "proj_1",
  "paperId": null,
  "taskId": null,
  "title": "Deep Learning Model Experiments",
  "blocks": [
    {
      "id": "block_1737465600001_aaa",
      "type": "h1",
      "content": "Model Architecture",
      "properties": {},
      "createdAt": 1737465600001
    },
    {
      "id": "block_1737465600002_bbb",
      "type": "paragraph",
      "content": "We implemented an <strong>EfficientNet-B4</strong> backbone with custom attention layers.",
      "properties": {},
      "createdAt": 1737465600002
    },
    {
      "id": "block_1737465600003_ccc",
      "type": "h2",
      "content": "Key Findings",
      "properties": {},
      "createdAt": 1737465600003
    },
    {
      "id": "block_1737465600004_ddd",
      "type": "bullet",
      "content": "Training converged after 50 epochs",
      "properties": { "level": 0 },
      "createdAt": 1737465600004
    },
    {
      "id": "block_1737465600005_eee",
      "type": "bullet",
      "content": "Best validation accuracy: <strong>94.2%</strong>",
      "properties": { "level": 0 },
      "createdAt": 1737465600005
    },
    {
      "id": "block_1737465600006_fff",
      "type": "todo",
      "content": "Run ablation study on attention mechanism",
      "properties": { "checked": false },
      "createdAt": 1737465600006
    },
    {
      "id": "block_1737465600007_ggg",
      "type": "code",
      "content": "model = EfficientNet(version='b4')\nmodel.compile(optimizer='adam', loss='ce')",
      "properties": { "language": "python" },
      "createdAt": 1737465600007
    },
    {
      "id": "block_1737465600008_hhh",
      "type": "quote",
      "content": "The attention mechanism significantly improved feature extraction in the later layers.",
      "properties": {},
      "createdAt": 1737465600008
    },
    {
      "id": "block_1737465600009_iii",
      "type": "divider",
      "content": "",
      "properties": {},
      "createdAt": 1737465600009
    }
  ],
  "createdAt": 1737465600000,
  "updatedAt": 1737552000000,
  "tags": ["deep-learning", "experiments", "efficientnet"],
  "status": "active"
}
```

## J. TECH STACK SUMMARY

**Frontend:**
- Pure HTML5 (contenteditable for rich text)
- Vanilla JavaScript ES6+ (no frameworks)
- CSS3 with CSS Variables for theming
- localStorage API for persistence

**No External Dependencies:**
- No React, Vue, Angular
- No Quill, TipTap, Slate
- No ProseMirror or Draft.js
- Pure browser APIs only

**Why Vanilla JS:**
- Full control over editor behavior
- No bundle size overhead
- Easy to extend and customize
- Matches existing codebase style
- No build step required

## K. PERFORMANCE CONSIDERATIONS

1. **Efficient Rendering:**
   - Only re-render changed blocks
   - Use innerHTML for static content
   - Event delegation for handlers

2. **Storage Optimization:**
   - JSON compression (planned)
   - Lazy loading of large notes
   - Batch save operations

3. **Memory Management:**
   - Destroy editor on unmount
   - Clear timers and event listeners
   - Limit history size

## L. ACCESSIBILITY

- Keyboard-first design
- ARIA labels (to be added)
- Focus management
- Screen reader support (planned)

---

## USAGE GUIDE

### For Users:
1. Navigate to any project
2. Click "Show Notes"
3. Start typing or press `/` for block types
4. Use Enter to create new blocks
5. Notes auto-save every 30 seconds

### For Developers:
1. Block editor is in `js/components/blockEditor.js`
2. Integrate by calling `BlockEditor.renderEditor(noteId, projectId)`
3. Initialize with `BlockEditor.init(noteId)`
4. Cleanup with `BlockEditor.destroy()`
5. Data stored in localStorage as `note_${noteId}`

---

**Last Updated:** January 21, 2026
**Version:** 1.0.0
**Status:** MVP Complete ✅
