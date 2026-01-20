# 🚀 Quick Start Guide

## Your Research Workspace is Ready!

🌐 **Live URL**: https://anhphrobotic-jpg.github.io/

---

## ✅ What's Been Upgraded

### New Features
- ✨ Notion-style interface with sidebar navigation
- 📊 Dashboard with overview widgets
- 📁 Database views for Projects, Tasks, Papers, Whiteboards
- 📄 PDF Viewer with annotation support (highlight & notes)
- 🌓 Light/Dark theme toggle
- 📱 Fully responsive mobile design

### Architecture
- Single-Page Application (SPA) with hash routing
- JSON-based databases (no backend needed)
- LocalStorage for user data (annotations, theme)
- Modular view system
- PDF.js integration for client-side PDF rendering

---

## 📝 Next Steps

### 1. Add Your Research Papers
Place PDF files in: `assets/pdf/`

Then update `data/papers.json`:
```json
{
  "id": "paper_1",
  "title": "Your Paper Title",
  "authors": "Author Names",
  "journal": "Conference/Journal Name",
  "year": 2024,
  "pdfPath": "assets/pdf/your-paper.pdf",
  "status": "to-read",
  "projectId": "proj_1"
}
```

### 2. Customize Your Data
Edit JSON files in `data/` folder:
- `projects.json` - Your research projects
- `tasks.json` - Todos linked to projects
- `papers.json` - Paper references
- `whiteboards.json` - Brainstorming boards

### 3. Test Locally
Open `index.html` in your browser to test changes before pushing.

### 4. Deploy Changes
```powershell
git add .
git commit -m "Add my research data"
git push
```

Wait 1-2 minutes for GitHub Pages to rebuild.

---

## 🎯 Key Features to Try

### PDF Annotations
1. Go to **Papers** section
2. Click any paper to open PDF viewer
3. Use toolbar:
   - 🖍️ **Highlight**: Click and drag to highlight text
   - 📝 **Note**: Click to add text notes
   - 💾 **Save**: Save your annotations

Annotations are stored in your browser's localStorage.

### Project Management
1. **Dashboard**: See active projects and upcoming tasks
2. **Projects**: View all projects, click one to see related tasks/papers
3. **Tasks**: Filter by status, see due dates
4. **Whiteboards**: Visual brainstorming space

### Mobile Support
On mobile devices:
- Tap **≡** icon to open/close sidebar
- Swipe gestures work on PDF viewer
- All features fully functional on touch devices

---

## 📂 File Structure

```
Your Workspace/
├── index.html           ← Main entry point
├── data/                ← Edit these JSON files
│   ├── projects.json    
│   ├── tasks.json
│   ├── papers.json
│   └── whiteboards.json
├── assets/
│   └── pdf/             ← Put your PDFs here
├── css/                 ← Styling
├── js/                  ← Application logic
└── backup_old/          ← Original files (safe to delete after testing)
```

---

## 🔧 Common Tasks

### Add New Project
Edit `data/projects.json`, add entry:
```json
{
  "id": "proj_3",
  "title": "New Research Project",
  "description": "Description here",
  "stage": "planning",
  "progress": 0,
  "startDate": "2024-01-15",
  "tags": ["AI", "Research"]
}
```

### Link Task to Project
In `data/tasks.json`:
```json
{
  "id": "task_5",
  "title": "Review literature",
  "projectId": "proj_3",    ← Link to project
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-01-30"
}
```

### Change Theme
Click 🌙/☀️ button in sidebar, or set default in `js/storage.js`.

---

## 🐛 Troubleshooting

**PDFs not showing?**
- Check file path in `papers.json` matches actual location
- Ensure PDF is in `assets/pdf/` folder
- Open browser console (F12) to see errors

**Changes not appearing on GitHub Pages?**
- Wait 2-3 minutes after pushing
- Hard refresh browser (Ctrl+Shift+R)
- Check Actions tab on GitHub for build status

**Sidebar not working on mobile?**
- Clear browser cache
- Try incognito/private mode
- Check JavaScript console for errors

---

## 📚 Documentation

Full documentation: See [README.md](README.md)

---

## 💡 Tips

1. **Backup before editing**: Original files are in `backup_old/`
2. **Test locally first**: Open `index.html` before pushing
3. **Use valid JSON**: Check syntax at jsonlint.com
4. **Commit often**: Small commits are easier to debug

---

## 🎉 Enjoy Your New Workspace!

Your research workspace is now live and ready to use. Start adding your projects, papers, and research materials!

**URL**: https://anhphrobotic-jpg.github.io/

Questions? Check the main README.md or browser console for errors.

---

*Last updated: 2024-01-15*
