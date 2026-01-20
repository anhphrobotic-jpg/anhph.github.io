# 🔄 Migration Guide - Project-Centric Refactor

## What Changed?

Your research workspace has been transformed from a **multi-page task manager** into a **project-centric PhD research system**.

---

## 🆕 New Features

### 1. **Project Detail Pages are Now Full Workspaces**

**Before**: Project page showed basic info + lists of related items

**After**: Project page is a complete workspace where you can:
- ✅ Add, edit, delete tasks directly
- 📚 Add, edit, delete papers directly
- 📝 Edit task status/type with inline dropdowns
- 💡 Create tasks from paper reading
- 📄 Add key takeaways to papers

### 2. **Enhanced Project Data Model**

New fields for PhD-level research:
- **Objective**: What you're trying to achieve
- **Key Questions**: Research questions driving your work
- **Current Blocker**: What's preventing progress
- **Last Decision**: Most recent strategic choice
- **Next Action**: Immediate next step

### 3. **Inline Editing**

No more navigating away to edit things:
- Click dropdowns to change task status/type
- Click ✏️ icons for detailed editing
- Changes persist immediately to localStorage

### 4. **Paper-to-Task Workflow**

Create tasks directly from papers:
- Reading a paper → get idea → create task
- Task automatically links to same project
- Reference to source paper in description

### 5. **Key Takeaways**

Document paper insights:
- Add bullet points of main findings
- Review without re-reading entire paper
- Build your literature review notes

---

## 💾 Data Migration

### Your Existing Data is Safe

All original data files are backed up in `backup_old/`:
- `projects_old.json`
- `tasks_old.json`
- `papers_old.json`

### New Data Structure

#### Projects now include:
```json
{
  "id": "proj_1",
  "title": "Your Project",
  "objective": "What you're achieving",
  "keyQuestions": [
    "Question 1?",
    "Question 2?"
  ],
  "currentBlocker": "What's blocking you",
  "lastDecision": "Recent decision",
  "nextAction": "Next step"
}
```

#### Tasks now include:
```json
{
  "id": "task_1",
  "projectId": "proj_1",
  "title": "Task title",
  "type": "research", // NEW: research/data/implementation/experiment/writing/admin/meeting
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-01-30"
}
```

#### Papers now include:
```json
{
  "id": "paper_1",
  "projectId": "proj_1",
  "title": "Paper title",
  "importance": "critical", // NEW: critical/high/medium/low
  "keyTakeaways": [         // NEW
    "Takeaway 1",
    "Takeaway 2"
  ]
}
```

---

## 🔄 How to Update Your Data

### Option 1: Start Fresh (Recommended for Testing)

The system ships with sample PhD-level data. Try it first:

1. Visit your site: https://anhphrobotic-jpg.github.io/
2. Navigate to a project
3. Try adding/editing tasks and papers
4. See how the new workflow feels

### Option 2: Migrate Your Data

If you want to keep your existing projects/tasks/papers:

1. **Open your old JSON files** from `backup_old/`
   
2. **Add new required fields** to projects:
   ```json
   {
     "id": "existing_proj_1",
     "title": "Existing Project Title",
     "description": "...",
     // Add these:
     "objective": "Write your research objective here",
     "keyQuestions": [
       "What are you trying to answer?",
       "What problem are you solving?"
     ],
     "currentBlocker": null,
     "lastDecision": null,
     "nextAction": "Define next step"
   }
   ```

3. **Add type to tasks**:
   ```json
   {
     "id": "existing_task_1",
     "projectId": "proj_1",
     "title": "Existing task",
     // Add this:
     "type": "research", // Choose: research/data/implementation/experiment/writing/admin/meeting
     "status": "todo",
     "priority": "high"
   }
   ```

4. **Add importance and takeaways to papers**:
   ```json
   {
     "id": "existing_paper_1",
     "projectId": "proj_1",
     "title": "Existing paper",
     // Add these:
     "importance": "high", // critical/high/medium/low
     "keyTakeaways": []    // Empty array for now, add later via UI
   }
   ```

5. **Update your data files**:
   - Copy updated JSON to `data/projects.json`
   - Copy updated JSON to `data/tasks.json`
   - Copy updated JSON to `data/papers.json`

6. **Commit and push**:
   ```powershell
   git add .
   git commit -m "Migrate data to new format"
   git push
   ```

---

## 🎯 Learning the New Workflow

### Day 1: Exploration
1. Open a project
2. Try adding a task with "+ Add Task"
3. Change task status by clicking dropdown
4. Edit a task with ✏️ icon
5. Delete a task with 🗑️ icon

### Day 2: Paper Integration
1. Add a paper with "+ Add Paper"
2. Open paper detail page (click paper row)
3. Add a key takeaway
4. Create a task from the paper
5. Go back to project and see the new task

### Day 3: Research Context
1. Review your project's objective
2. Add key research questions (edit data file)
3. Update "Current Blocker" if applicable
4. Set "Next Action" for focus

### Week 1: Full Adoption
- Use project pages as primary workspace
- Rarely visit global Tasks/Papers views
- Edit everything inline
- Rely on modals for detailed changes

---

## 📝 Breaking Changes

### What No Longer Works the Same

#### 1. **Global Task/Paper Views**
- **Before**: Could edit tasks/papers from global views
- **After**: Global views are read-only reference
- **Reason**: Editing happens in project context now
- **Workaround**: Click task's project link, edit there

#### 2. **LocalStorage is Source of Truth**
- **Before**: JSON files were the only data source
- **After**: localStorage edits override JSON
- **Impact**: Edits persist in browser, not in repo
- **Solution**: Export data periodically

#### 3. **No Automatic Sync**
- **Before**: Changes to JSON files immediately visible
- **After**: Must refresh page to see JSON changes
- **Note**: localStorage edits apply immediately

---

## 🆘 Common Migration Issues

### Issue: "I can't find where to edit tasks"
**Solution**: Open the project, tasks are editable there

### Issue: "My old tasks don't show up"
**Solution**: Check if tasks have `projectId` linking to valid project

### Issue: "Task type shows as 'undefined'"
**Solution**: Tasks need `type` field. Edit JSON to add it.

### Issue: "Where did my annotations go?"
**Solution**: Annotations are in localStorage under `research_annotations`. They persist even after data migration.

### Issue: "I prefer the old way"
**Solution**: Revert by:
1. Restore files from `backup_old/`
2. Copy old `js/views/projects.js` from `backup_old/projects_view_old.js`
3. Commit and push

---

## ✅ Migration Checklist

- [ ] Backup current data (already in `backup_old/`)
- [ ] Try new system with sample data
- [ ] Decide: keep sample data or migrate existing data
- [ ] If migrating: Add new fields to JSON files
- [ ] Test adding a task in project view
- [ ] Test editing task status inline
- [ ] Test adding a paper
- [ ] Test creating task from paper
- [ ] Test adding takeaway to paper
- [ ] Verify PDF annotations still work
- [ ] Export localStorage data for backup
- [ ] Update any external documentation referencing old workflow

---

## 🎓 For PhD Students

### Why This is Better for Research

**Old System**: Task manager with papers attached

**New System**: Research workspace with integrated workflows

### Research-Specific Benefits

1. **Context Preservation**
   - Key questions keep you focused
   - Objective prevents scope creep
   - Blockers identify escalation needs

2. **Literature Integration**
   - Papers drive tasks (implementation based on reading)
   - Takeaways build literature review
   - Importance ratings prioritize reading

3. **Strategic Thinking**
   - Last Decision documents choices
   - Next Action provides focus
   - Current Blocker shows dependencies

4. **Long-term PhD Work**
   - Projects last years
   - Need rich context
   - This system supports that

---

## 🚀 Next Steps

1. **Read** [RESEARCH_GUIDE.md](RESEARCH_GUIDE.md) for full feature documentation
2. **Try** the new system with sample data
3. **Migrate** your data when comfortable
4. **Customize** project fields to match your research style
5. **Export** data regularly as backup

---

## 📞 Questions?

- Check [RESEARCH_GUIDE.md](RESEARCH_GUIDE.md) for detailed usage
- Check [README.md](README.md) for general documentation
- Inspect `js/views/projects.js` to understand implementation
- Browser console (F12) shows errors

---

**Welcome to your project-centric research workspace!** 🎓📚

*Migration Guide Version: 1.0*  
*Date: January 20, 2026*
