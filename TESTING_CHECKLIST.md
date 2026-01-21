# Block Editor Testing Checklist

## Testing Guide - Verify All Features Work

### 🧪 1. BLOCK TYPES TEST

**Open a project → Research Notes section**

- [ ] Type text → Paragraph block works
- [ ] Type `/h1` → Enter → Converts to H1
- [ ] Type `/h2` → Enter → Converts to H2  
- [ ] Type `/h3` → Enter → Converts to H3
- [ ] Type `/bullet` → Enter → Creates bullet list
- [ ] Type `/number` → Enter → Creates numbered list
- [ ] Type `/todo` → Enter → Creates checkbox (click checkbox works)
- [ ] Type `/code` → Enter → Creates code block (select language works)
- [ ] Type `/quote` → Enter → Creates quote block
- [ ] Type `/divider` → Enter → Creates horizontal line
- [ ] Type `/callout` → Enter → Creates callout (click emoji to change)
- [ ] Type `/toggle` → Enter → Creates toggle (click arrow to collapse/expand)
- [ ] Type `/image` → Enter → Creates image block (upload or URL)

### ⌨️ 2. KEYBOARD SHORTCUTS TEST

- [ ] Type text → Press **Enter** → New block created below
- [ ] Create empty block → Press **Backspace** → Block deleted
- [ ] Type text → Press **Arrow Up** → Cursor moves to previous block
- [ ] Type text → Press **Arrow Down** → Cursor moves to next block
- [ ] Create list → Press **Tab** → List indented (if implemented)
- [ ] Indented list → Press **Shift+Tab** → List unindented
- [ ] Type text → Press **Ctrl+Z** (or Cmd+Z) → Undo works
- [ ] After undo → Press **Ctrl+Shift+Z** → Redo works
- [ ] Select text → Press **Ctrl+B** → Text becomes bold
- [ ] Select text → Press **Ctrl+I** → Text becomes italic
- [ ] Select text → Press **Ctrl+U** → Text becomes underlined
- [ ] Select text → Press **Ctrl+K** → Link prompt appears
- [ ] Press **Ctrl+S** → "Note saved" toast appears

### 🎨 3. INLINE FORMATTING TEST

**Markdown Shortcuts:**
- [ ] Type `**bold**` → Converts to **bold**
- [ ] Type `*italic*` → Converts to *italic*
- [ ] Type `` `code` `` → Converts to `inline code`
- [ ] Type `# Heading` → Converts to H1
- [ ] Type `## Heading` → Converts to H2
- [ ] Type `### Heading` → Converts to H3
- [ ] Type `- item` → Converts to bullet list
- [ ] Type `1. item` → Converts to numbered list
- [ ] Type `[] task` → Converts to todo
- [ ] Type `> quote` → Converts to quote
- [ ] Type `---` → Converts to divider

**Selection Toolbar:**
- [ ] Select text → Toolbar appears above selection
- [ ] Click **B** button → Text becomes bold
- [ ] Click **I** button → Text becomes italic
- [ ] Click **U** button → Text becomes underlined
- [ ] Click **S** button → Text gets strikethrough
- [ ] Click **</>** button → Text becomes inline code
- [ ] Click **🔗** button → Link prompt appears
- [ ] Click **🎨** button → Color prompt appears

### 🖼️ 4. MEDIA & IMAGES TEST

**Code Block:**
- [ ] Create code block → Type code
- [ ] Change language dropdown → Language changes
- [ ] Click **📋 Copy** button → "Code copied" toast appears
- [ ] Paste copied code → Code is correct
- [ ] Press **Tab** in code → 4 spaces inserted (not focus change)

**Image Block:**
- [ ] Type `/image` → Click "Upload Image" → Select file → Image appears
- [ ] Type `/image` → Click "Add URL" → Enter URL → Image appears
- [ ] Image displayed → Click "Change URL" → Enter new URL → Image updates
- [ ] Image displayed → Click "Resize" → Enter width (e.g., 50%) → Image resizes
- [ ] Click caption area → Type caption → Caption saves

### 💾 5. PERSISTENCE TEST

- [ ] Type some content → Wait 30 seconds → "Last saved: Just now" updates
- [ ] Type content → Press **Ctrl+S** → "Note saved" toast appears
- [ ] Create multiple blocks → Refresh page → All blocks restored correctly
- [ ] Check localStorage → Key `note_project_{id}` exists with JSON data
- [ ] Make changes → Press Ctrl+Z → Undo works → Refresh → Undo state not lost
- [ ] Close and reopen project → Notes still there

### 🔗 6. INTEGRATION TEST

- [ ] Open project → "Research Notes" section visible
- [ ] Click "Hide Notes" → Notes section collapses
- [ ] Click "Show Notes" → Notes section expands
- [ ] Edit note title → Title saves
- [ ] Click "📥 Export" → Markdown file downloads
- [ ] Open downloaded .md file → Content matches note

### 🎯 7. DRAG & DROP TEST

- [ ] Hover over block → **⋮⋮** handle appears
- [ ] Drag handle → Blue drop indicator appears
- [ ] Drop block → Blocks reorder correctly
- [ ] Drag multiple times → Order always correct

### 🎛️ 8. BLOCK ACTIONS MENU TEST

- [ ] Click **⋮⋮** handle → Menu appears
- [ ] Click "Duplicate" → Block duplicated below
- [ ] Click "Copy" → "Copied to clipboard" toast → Paste → Content correct
- [ ] Click "Delete" → Block deleted
- [ ] Click outside menu → Menu closes

### 🔄 9. UNDO/REDO DEEP TEST

- [ ] Create block → Type "A" → Undo → Block content empty
- [ ] Type "A" → Type "B" → Undo → Only "A" remains
- [ ] Undo → Undo → Redo → "A" restored
- [ ] Make 10 changes → Undo 10 times → All undone
- [ ] After undo → Type new text → Redo disabled (history branch cleared)
- [ ] Delete block → Undo → Block restored

### 📱 10. RESPONSIVE & UI TEST

**Desktop:**
- [ ] All blocks render correctly
- [ ] Handle appears on hover
- [ ] Selection toolbar positioned correctly
- [ ] Command menu positioned below block

**Mobile (resize browser < 768px):**
- [ ] Blocks still editable
- [ ] Handle always visible (no hover needed)
- [ ] Selection toolbar wraps on small screen
- [ ] Command menu fits screen width
- [ ] Image blocks responsive

### 🌙 11. DARK MODE TEST

- [ ] Toggle dark mode → All blocks readable
- [ ] Selection toolbar visible in dark mode
- [ ] Code block background contrasts correctly
- [ ] Callout colors work in dark mode
- [ ] Images have proper borders

### 🎭 12. SPECIAL BLOCKS TEST

**Callout:**
- [ ] Create callout → Click emoji → Enter new emoji → Emoji changes
- [ ] Different callout types render with correct colors (info, success, warning, error)

**Toggle:**
- [ ] Create toggle → Type title → Type hidden content
- [ ] Click arrow → Content collapses
- [ ] Click arrow again → Content expands
- [ ] Collapsed state persists after save

**Todo:**
- [ ] Create todo item → Click checkbox → Checkmark appears
- [ ] Check item → Refresh page → Item still checked
- [ ] Uncheck item → Refresh → Item unchecked

### ⚠️ 13. EDGE CASES TEST

- [ ] Create empty note → Only one paragraph block exists
- [ ] Delete all blocks → At least one block remains
- [ ] Type very long text (1000+ chars) → No performance issues
- [ ] Create 50+ blocks → Scrolling smooth
- [ ] Paste formatted text from Word/Google Docs → Formatting stripped correctly
- [ ] Press Enter rapidly 10 times → 10 blocks created
- [ ] Undo/Redo rapidly → No errors
- [ ] Switch projects while editing → Note saves correctly

### 🐛 14. ERROR HANDLING TEST

- [ ] Image URL invalid (404) → Broken image icon shows
- [ ] Image URL empty → Placeholder shows
- [ ] localStorage full → Error handled gracefully (check console)
- [ ] Corrupt JSON in localStorage → Note resets or error message
- [ ] Network offline → Auto-save still works (localStorage)

---

## ✅ Pass Criteria

- **Critical:** All keyboard shortcuts work
- **Critical:** Undo/Redo works correctly
- **Critical:** Auto-save and manual save work
- **Critical:** All block types render and edit correctly
- **Important:** Drag & drop works smoothly
- **Important:** Selection toolbar appears and formats correctly
- **Important:** Image upload and URL insertion work
- **Nice-to-have:** Mobile responsive
- **Nice-to-have:** Dark mode compatible

---

## 🎉 If All Tests Pass:

**The Block Editor is production-ready!**

You have a fully-featured, Notion-like block editor with:
- 11+ block types
- Full keyboard navigation
- Undo/Redo history
- Drag & drop reordering
- Inline markdown formatting
- Image support
- Auto-save persistence
- Export to Markdown
- No external dependencies

**Ship it! 🚀**
