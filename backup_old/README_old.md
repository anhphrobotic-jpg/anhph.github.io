# Research Project Manager

Một website quản lý project research cá nhân, chạy hoàn toàn bằng HTML, CSS, JavaScript (không backend, không framework). Có thể deploy trực tiếp trên GitHub Pages.

## ✨ Tính năng

### Dashboard (index.html)
- 📊 Hiển thị danh sách tất cả projects
- 🔍 Tìm kiếm và lọc theo trạng thái, tags
- ➕ Tạo, chỉnh sửa, xóa projects
- 📈 Thống kê tổng quan (tổng số project, tiến độ trung bình)
- 📥📤 Export/Import dữ liệu JSON

### Project Detail (project.html)
Mỗi project có 5 modules:

#### 1. Overview
- Mục tiêu nghiên cứu
- Câu hỏi nghiên cứu
- Hypothesis
- Trạng thái hiện tại

#### 2. Tasks & Progress
- Todo list với checklist
- Tự động tính tiến độ %
- Trạng thái: Todo / Doing / Done

#### 3. Notes
- Ghi chú với Markdown đơn giản
- Hỗ trợ: Heading, Bold, Italic, Code, Links, Lists

#### 4. References
- Quản lý tài liệu tham khảo
- Thông tin: Title, Authors, Year, URL/DOI, Type, Notes
- Click để mở link ngoài

#### 5. Whiteboard
- Canvas vẽ tay
- Tools: Pen, Eraser, Color picker, Brush size
- Lưu trạng thái canvas

## 🎨 UI/UX Features

- ✅ Light/Dark theme toggle
- ✅ Responsive design (Desktop ưu tiên, Mobile usable)
- ✅ Animations mượt mà
- ✅ Modal dialogs
- ✅ Toast notifications
- ✅ Empty states

## ⌨️ Keyboard Shortcuts

### Dashboard
- `Ctrl+N`: Tạo project mới
- `Ctrl+E`: Export dữ liệu
- `Ctrl+I`: Import dữ liệu
- `Esc`: Đóng modal

### Project Detail
- `Ctrl+N`: Thêm item mới (tùy tab hiện tại)
- `Ctrl+S`: Lưu whiteboard
- `Esc`: Đóng modal

## 🗂️ Cấu trúc Project

```
Websites_html/
├── index.html              # Dashboard
├── project.html            # Chi tiết project
├── css/
│   ├── theme.css          # Theme variables & animations
│   └── main.css           # Main styles & responsive
├── js/
│   ├── storage.js         # LocalStorage wrapper & data logic
│   ├── ui.js              # UI helpers & utilities
│   ├── app.js             # Dashboard logic
│   └── project.js         # Project detail logic
└── assets/
    ├── icons/
    └── images/
```

## 🏗️ Kiến trúc

### Data Layer (storage.js)
- LocalStorage wrapper
- CRUD operations cho projects
- Module operations (tasks, notes, references, whiteboard)
- Export/Import JSON
- Search & filter

### UI Layer (ui.js)
- Theme management
- Modal controls
- Toast notifications
- Date formatting
- Simple Markdown parser
- Keyboard shortcuts handler
- Animation helpers

### Application Layer
- **app.js**: Dashboard logic (list projects, search, filter, stats)
- **project.js**: Project detail logic (tabs, modules, canvas)

## 🚀 Deployment

### GitHub Pages

1. Tạo repository mới trên GitHub
2. Push code lên repository:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

3. Vào Settings > Pages
4. Chọn Source: Deploy from branch
5. Chọn Branch: main, folder: / (root)
6. Click Save

Website sẽ available tại: `https://username.github.io/repo-name/`

### Local Development

Chỉ cần mở file `index.html` bằng browser, hoặc dùng local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve

# VS Code Live Server extension
```

## 💾 Dữ liệu

Tất cả dữ liệu lưu trong LocalStorage của browser:
- `research_projects`: Danh sách projects
- `research_settings`: Settings
- `research_theme`: Light/Dark theme

**Lưu ý**: LocalStorage có giới hạn ~5-10MB tùy browser. Với whiteboard canvas, nên export data định kỳ.

## 🔧 Tùy chỉnh & Mở rộng

### Thêm Field mới cho Project

1. Cập nhật data model trong `storage.js`:
```javascript
createProject(projectData) {
    const newProject = {
        // ... existing fields
        customField: projectData.customField || ''
    };
}
```

2. Thêm input vào form trong `index.html`
3. Cập nhật render function trong `app.js`

### Thêm Module mới

1. Thêm tab button trong sidebar (`project.html`)
2. Thêm tab content section
3. Implement logic trong `project.js`

### Thay đổi Theme Colors

Edit CSS variables trong `css/theme.css`:
```css
:root {
    --color-primary: #your-color;
    --bg-primary: #your-bg;
}
```

## 🎯 Use Cases

- 📚 Quản lý research projects cá nhân
- 📖 Literature review organization
- 🧪 Lab experiment tracking
- 📝 Academic writing notes
- 🎓 Thesis/dissertation management
- 💡 Idea brainstorming & development

## 🐛 Known Limitations

- LocalStorage capacity (~5-10MB)
- No real-time collaboration
- No cloud sync (manual export/import)
- Basic Markdown support only
- Canvas drawing không có undo/redo (có thể thêm sau)

## 🔮 Future Enhancements

- [ ] Undo/Redo cho canvas
- [ ] More Markdown features
- [ ] Timeline view cho projects
- [ ] Gantt chart
- [ ] File attachments (base64 hoặc external links)
- [ ] Cloud sync (Google Drive API, Dropbox)
- [ ] PDF export
- [ ] Collaboration mode
- [ ] Advanced search (fuzzy matching)
- [ ] Tags autocomplete

## 📄 License

Free to use for personal and educational purposes.

## 🤝 Contributing

Đây là personal project, nhưng bạn có thể fork và customize theo nhu cầu của mình.

---

**Developed with ❤️ for researchers and students**
