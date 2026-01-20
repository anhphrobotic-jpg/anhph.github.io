# 🎓 PhD-Level Research Workspace - User Guide

## Overview

Your research workspace has been transformed into a **project-centric system** where each project functions as a complete research hub. All tasks and papers are manageable directly within their project context - no need to navigate away.

---

## 🎯 Core Philosophy: Project-Centric Research

### Traditional Approach (Old)
- Tasks managed separately in a global task list
- Papers managed in a separate library
- Projects just link to other entities
- Switching between views to manage research

### New Approach (Current)
- **Projects are the primary workspace**
- Tasks and papers editable WITHIN each project
- Create, edit, delete directly in project view
- Everything you need in one place

---

## 📊 Project Detail Page - Your Research Hub

Each project page now contains:

### 1. **Research Context Header**
Visual overview of your research:

- **🎯 Objective**: What you're trying to achieve
- **❓ Key Research Questions**: Questions driving your work
- **🚫 Current Blocker**: What's stopping progress
- **💡 Last Decision**: Most recent strategic choice
- **⚡ Next Action**: Immediate next step

**Why this matters**: PhD research requires keeping strategic context in mind. These fields help you remember WHY you're doing what you're doing.

### 2. **✅ Tasks Section**
Fully editable task table with:

- **Inline editing**: Click dropdown to change type/status
- **Add Task**: Creates task automatically linked to this project
- **Edit Task**: Full modal for detailed editing
- **Delete Task**: Remove tasks you no longer need
- **Task Types**: Research, Data, Implementation, Experiment, Writing, Admin, Meeting
- **Summary Stats**: See todo/in-progress/done counts at a glance

### 3. **📚 Papers Section**
Research paper management with:

- **Inline status changes**: Update reading status with one click
- **Importance ratings**: Critical, High, Medium, Low
- **Add Paper**: Link PDFs and metadata
- **Edit Paper**: Update all fields including notes
- **Delete Paper**: Remove papers (annotations are also deleted)
- **Click paper row**: Opens PDF viewer with annotations

### 4. **🎨 Whiteboards Section**
Visual brainstorming space linked to project

---

## ✏️ Inline Editing - Notion-Style Interaction

### Task Editing

**Quick Edits (No Modal)**:
- **Type**: Click dropdown → select (Research, Data, Implementation, etc.)
- **Status**: Click dropdown → select (Todo, In Progress, Done)
- **Auto-completion**: When you mark task as "Done", completion timestamp is saved

**Full Edits (Modal)**:
- Click ✏️ icon on task row
- Edit title, description, type, priority, due date
- Changes persist immediately

### Paper Editing

**Quick Edits**:
- **Status**: To Read → Reading → Read
- **Importance**: Adjust priority as you learn more

**Full Edits**:
- Click ✏️ icon on paper row
- Edit all metadata
- Update PDF path if needed

---

## 📝 Creating Tasks and Papers

### Add Task
1. Click **"+ Add Task"** button in project
2. Fill modal form:
   - **Title** (required): Brief description
   - **Description**: Detailed information
   - **Type**: Research/Data/Implementation/etc.
   - **Priority**: Low/Medium/High
   - **Due Date**: Optional deadline
3. Click **"Add Task"**
4. Task appears immediately in project

**Auto-linking**: Task is automatically assigned to the current project!

### Add Paper
1. Click **"+ Add Paper"** button in project
2. Fill modal form:
   - **Title** (required): Paper title
   - **Authors**: Author names
   - **Journal/Venue**: Where published
   - **Year**: Publication year
   - **Status**: To Read/Reading/Read
   - **Importance**: Critical/High/Medium/Low
   - **PDF Path**: e.g., `assets/pdf/your-paper.pdf`
   - **Notes**: Why this paper matters
3. Click **"Add Paper"**
4. Paper appears in project table

### Create Task from Paper ⚡ (New Feature!)
When reading a paper and you realize you need to implement something:

1. Open paper detail page
2. Scroll to **"⚡ Create Task from This Paper"** section
3. Click **"+ Create Task"** button
4. Fill task details
5. Task is automatically:
   - Linked to the same project as the paper
   - Annotated with reference to the source paper

**Use case**: "After reading this transformer paper, I need to implement multi-head attention in my model"

---

## 💡 Paper Reading Workflow

### Enhanced PDF Integration

When you open a paper, you now have:

#### 1. **Key Takeaways Section**
- Document important insights as you read
- Click **"+ Add Takeaway"** to add bullet points
- Takeaways persist with the paper
- Review later without re-reading entire PDF

**Example takeaways**:
- "Skip connections solve vanishing gradient problem"
- "Batch normalization after convolution is critical"
- "Residual learning easier to optimize than direct mappings"

#### 2. **Create Task Button**
- Immediately derive action items from reading
- No need to remember later
- Task links back to the paper

#### 3. **PDF Viewer with Annotations**
- Highlight text
- Add notes
- Draw on PDF
- All annotations saved to localStorage
- Persist across sessions

### Recommended Reading Flow
1. Open paper from project
2. Read PDF, highlighting key sections
3. Add takeaways as you go
4. Create tasks for follow-up work
5. Mark status as "Read" when done

---

## 💾 Data Persistence

### Where Your Data Lives

#### JSON Files (Original Data)
- `data/projects.json` - Project definitions
- `data/tasks.json` - Initial task data
- `data/papers.json` - Paper library
- `data/whiteboards.json` - Whiteboards

#### LocalStorage (Edits & User Data)
- `research_tasks_data` - All task CRUD operations
- `research_papers_data` - All paper CRUD operations
- `research_projects_data` - Project updates
- `research_annotations` - PDF annotations by paper ID
- `research_theme` - Light/dark theme preference

### Persistence Strategy
1. **Initial Load**: Data from JSON files
2. **Edits**: Saved to localStorage immediately
3. **On Reload**: localStorage data merged with JSON files
4. **localStorage takes precedence** for edited entities

### Exporting Your Work
Since this runs on GitHub Pages (no backend), edits are stored in your browser.

To backup:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Copy `research_tasks_data` and `research_papers_data`
4. Save as JSON files
5. Later, manually update the JSON files in your repo

**Or use console**:
```javascript
// Export all data
const backup = Storage.exportAllData();
console.log(JSON.stringify(backup, null, 2));
// Copy this and save to file
```

---

## 📱 Mobile & Tablet Use

### Touch-Friendly Features
- All buttons min 44px (thumb-friendly)
- Inline selects work with touch
- Modals scrollable on small screens
- Sidebar collapsible on mobile

### Tablet + Stylus Workflow
Perfect for paper annotation:
1. Open paper on tablet
2. Use stylus to highlight and draw
3. Add takeaways with keyboard
4. Create tasks on the go

### Mobile Reading
- Read papers on phone
- Mark status changes
- Add quick takeaways
- Full editing via modals

---

## 🎯 Use Cases & Workflows

### Use Case 1: Literature Review
**Scenario**: Starting new research area, need to read 20 papers

1. Create project: "Deep Learning for Medical Imaging Literature Review"
2. Add all 20 papers with status "To Read"
3. Set importance levels
4. As you read each paper:
   - Annotate PDF
   - Add key takeaways
   - Mark as "Read"
5. Create tasks for experiments based on insights

### Use Case 2: Running Experiments
**Scenario**: Testing different model architectures

1. Project: "Model Architecture Comparison"
2. Add tasks:
   - "Implement ResNet baseline" (Implementation)
   - "Run ResNet experiments" (Experiment)
   - "Implement EfficientNet" (Implementation)
   - "Compare results" (Research)
3. Link relevant papers (ResNet paper, EfficientNet paper)
4. Update task status as you progress
5. Track progress bar filling up

### Use Case 3: Writing Paper
**Scenario**: Writing conference submission

1. Project: "NeurIPS 2026 Submission"
2. Tasks:
   - "Write introduction" (Writing)
   - "Create figures" (Writing)
   - "Run final experiments" (Experiment)
   - "Proofread" (Writing)
3. Papers: All references you'll cite
4. Whiteboard: Outline and structure
5. Track progress as you complete sections

### Use Case 4: Dealing with Blocker
**Scenario**: Waiting for something outside your control

1. Update project "Current Blocker": "Waiting for IRB approval"
2. Update "Last Decision": "Will work on data preprocessing while waiting"
3. Create alternative tasks that don't depend on blocker
4. Update "Next Action" to reflect new priority

---

## 🚀 Pro Tips

### 1. **Use Task Types Effectively**
- **Research**: Reading papers, literature review
- **Data**: Collecting, cleaning, preparing datasets
- **Implementation**: Writing code
- **Experiment**: Running experiments, ablation studies
- **Writing**: Papers, reports, documentation
- **Admin**: IRB approvals, meeting scheduling
- **Meeting**: Advisor meetings, collaborations

Filter by type to see all "Experiment" tasks across projects!

### 2. **Importance Ratings for Papers**
- **Critical**: Foundation papers you reference repeatedly
- **High**: Directly relevant to your work
- **Medium**: Related work, good to know
- **Low**: Tangentially related

Sort papers by importance to prioritize reading.

### 3. **Key Questions as North Star**
Write your key research questions at project start.
Review them weekly to ensure you're staying focused.

### 4. **Blockers vs. Challenges**
- **Blocker**: External dependency (IRB, advisor feedback, hardware)
- **Challenge**: Internal difficulty you're working through

Only list true blockers in "Current Blocker" field.

### 5. **Next Action = Single Task**
Keep it focused: "Complete baseline experiments by Friday"
Not: "Finish everything and submit paper"

### 6. **Takeaways = Future Self Documentation**
Write takeaways as if explaining to yourself in 6 months.
Your future self will thank you.

---

## 🐛 Troubleshooting

### "My edits disappeared after refresh"
- **Cause**: Browser cleared localStorage
- **Solution**: Export data regularly via DevTools
- **Prevention**: Don't use private/incognito mode

### "Task won't delete"
- **Check**: Is there a JavaScript error in console?
- **Try**: Hard refresh (Ctrl+Shift+R)
- **Workaround**: Edit task to mark as "Done" instead

### "Paper status not changing"
- **Check**: Did you click dropdown and select?
- **Issue**: Need to actively select, clicking doesn't toggle
- **Fix**: Click dropdown, then click desired status

### "Modal won't close"
- **Fix 1**: Click X button
- **Fix 2**: Click outside modal on dark overlay
- **Fix 3**: Press Escape key (if implemented)

### "Changes not showing in global views"
- **Expected**: This is normal
- **Why**: Global views show original JSON data
- **Solution**: Project pages show localStorage edits correctly

---

## 📚 Keyboard Shortcuts (Future Enhancement)

Currently no keyboard shortcuts, but you can add them by editing `js/views/projects.js`:

```javascript
// Example: Press 'n' to open Add Task modal
document.addEventListener('keypress', (e) => {
    if (e.key === 'n' && !e.target.matches('input, textarea')) {
        const projectId = getCurrentProjectId();
        ProjectsView.showAddTaskModal(projectId);
    }
});
```

---

## 🎓 PhD Student Tips

### Time Management
- Use due dates for conference deadlines
- Priority levels for urgency
- Status for current focus

### Research Strategy
- Key Questions guide what papers to read
- Objective keeps you from scope creep
- Blockers help you identify what to escalate to advisor

### Documentation
- Key Takeaways = your literature review notes
- Tasks = your lab notebook
- Papers = your bibliography, annotated

### Collaboration
- Share project objective with advisor
- Next Action = what you'll demo next meeting
- Blockers = what you need help with

---

## 🔮 Future Enhancements

Possible additions you can implement:

1. **Bi-directional Task-Paper Links**
   - Show which papers influenced which tasks
   - Track implementation progress per paper

2. **Gantt Chart View**
   - Visualize task timeline
   - Dependencies between tasks

3. **Bibliography Export**
   - Auto-generate BibTeX from papers
   - Export for LaTeX writing

4. **Collaboration Features**
   - Share project with advisor
   - Comment threads on papers

5. **AI Integration**
   - Summarize papers automatically
   - Suggest related papers

---

## 📞 Support

### Getting Help
1. Check browser console (F12) for errors
2. Review this guide
3. Check main README.md
4. Inspect the code in `js/views/projects.js`

### Reporting Issues
When something breaks:
1. Note which button you clicked
2. Check browser console for errors
3. Note your browser/version
4. Try in different browser

---

## ✅ Quick Reference

| Action | Location | How |
|--------|----------|-----|
| Add Task | Project detail page | Click "+ Add Task" |
| Edit Task | Task row | Click ✏️ icon |
| Delete Task | Task row | Click 🗑️ icon |
| Change Task Status | Task row | Click status dropdown |
| Add Paper | Project detail page | Click "+ Add Paper" |
| Edit Paper | Paper row | Click ✏️ icon |
| Delete Paper | Paper row | Click 🗑️ icon |
| Annotate PDF | Paper detail page | Use PDF viewer toolbar |
| Add Takeaway | Paper detail page | Click "+ Add Takeaway" |
| Create Task from Paper | Paper detail page | Click "+ Create Task" |
| Update Project | Project header | (Future: click edit icon) |
| Export Data | Browser DevTools | Application → localStorage |

---

**Your research workspace is now a professional-grade PhD research management system. Use it well!** 🎓

*Last updated: January 20, 2026*
