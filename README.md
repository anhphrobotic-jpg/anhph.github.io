# Professional Research Workspace

A Notion-like personal research management system built with vanilla HTML, CSS, and JavaScript.

## 🚀 Features

### Core Functionality
- **Dashboard**: Overview of active projects, upcoming tasks, reading queue, and recent whiteboards
- **Projects**: Manage research projects with progress tracking and related entities
- **Tasks**: Track todos with priorities, due dates, and project associations
- **Papers**: Organize research papers with PDF viewer and annotation tools
- **Whiteboards**: Visual brainstorming space for ideas and diagrams

### PDF Viewer & Annotations (Critical Feature)
- Client-side PDF viewing using PDF.js
- Highlight text on PDFs
- Add text notes at specific locations
- Annotations saved to localStorage
- Page navigation and zoom controls

### Design
- Notion-inspired clean interface
- Light/Dark theme support
- Fully responsive (desktop, tablet, mobile)
- Professional academic aesthetic

## 📂 Project Structure

```
├── index.html                 # Main SPA entry point
├── data/                      # JSON databases
│   ├── projects.json
│   ├── tasks.json
│   ├── papers.json
│   └── whiteboards.json
├── css/
│   ├── theme.css             # Design tokens & themes
│   └── main.css              # Layout & components
├── js/
│   ├── app.js                # Main application controller
│   ├── storage.js            # Data layer (JSON + localStorage)
│   ├── ui.js                 # UI utilities
│   ├── views/                # Page views
│   │   ├── dashboard.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── papers.js
│   │   └── whiteboards.js
│   └── components/           # Reusable components
│       ├── sidebar.js
│       ├── table.js
│       └── pdfViewer.js
├── assets/
│   ├── pdf/                  # Store your PDF files here
│   ├── images/
│   └── icons/
└── backup_old/               # Original files backup
```

## 🎯 Getting Started

### 1. Add Your PDFs
Place your research papers (PDF files) in `assets/pdf/` directory.

### 2. Update Data
Edit JSON files in `data/` directory to add your projects, tasks, papers, and whiteboards.

Example paper entry in `data/papers.json`:
```json
{
  "id": "paper_1",
  "title": "Your Paper Title",
  "authors": "Author Names",
  "journal": "Journal Name",
  "year": 2024,
  "pdfPath": "assets/pdf/your-paper.pdf",
  "status": "to-read",
  "projectId": "proj_1",
  "notes": "Important findings..."
}
```

### 3. Open in Browser
Simply open `index.html` in a modern web browser. No server required!

### 4. Deploy to GitHub Pages
```powershell
git add .
git commit -m "Update research workspace"
git push
```

Your site will be live at: https://anhphrobotic-jpg.github.io/

## 📖 Usage Guide

### Navigation
- Use sidebar to switch between sections (Dashboard, Projects, Tasks, Papers, Whiteboards)
- Click on items in tables to view details
- Mobile: Tap menu icon (≡) to toggle sidebar

### PDF Annotations
1. Navigate to Papers section
2. Click on a paper to open PDF viewer
3. Click "🖍️ Highlight" to draw highlights on PDF
4. Click "📝 Note" to add text notes
5. Click "💾 Save" to persist annotations

### Themes
Click the theme toggle button (🌙/☀️) in sidebar to switch between light and dark modes.

### Data Management
All data is stored in:
- **JSON files** (`data/` directory) - Projects, tasks, papers, whiteboards
- **LocalStorage** - User preferences (theme, annotations)

## 🔧 Customization

### Add New Project
Edit `data/projects.json`:
```json
{
  "id": "proj_new",
  "title": "New Project",
  "description": "Project description",
  "stage": "planning",
  "progress": 0,
  "startDate": "2024-01-01",
  "tags": ["tag1", "tag2"]
}
```

### Add New Task
Edit `data/tasks.json`:
```json
{
  "id": "task_new",
  "title": "New Task",
  "description": "Task description",
  "projectId": "proj_new",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

### Colors & Styling
Edit CSS variables in `css/theme.css`:
```css
:root {
  --primary: #your-color;
  --background: #your-bg-color;
  /* ... */
}
```

## 🌐 Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

Requires JavaScript enabled.

## 📦 Dependencies
- **PDF.js** (v3.11.174) - Loaded from CDN
- No other external dependencies

## 🔒 Data Privacy
All data is stored locally:
- JSON files in your repository
- LocalStorage in your browser
- No external servers or analytics

## 🐛 Troubleshooting

### PDFs not loading?
- Check PDF path in `data/papers.json` matches actual file location
- Ensure PDF files are in `assets/pdf/` directory
- Check browser console for errors

### Annotations not saving?
- Ensure localStorage is enabled in browser
- Check browser console for storage errors
- Try different browser if issues persist

### Mobile sidebar not working?
- Clear browser cache
- Try hard refresh (Ctrl+F5)
- Check console for JavaScript errors

## 📝 Notes
- Original files backed up in `backup_old/` directory
- Annotations stored per paper ID in localStorage
- Theme preference persists across sessions

## 🚀 Future Enhancements
- Export annotations to PDF
- Search functionality
- Data export/import
- Collaborative features
- Cloud sync

## 📄 License
Personal research project - use freely for your own research needs.

---

Built with ❤️ for academic research
