# Plan and Create New Milestone - Execute from Top to Bottom

Creates a new milestone with proper structure, documentation, and project integration through an interactive, adaptive process.

## Create a TODO with EXACTLY these 8 items

1. Parse arguments and analyze project context
2. Interactive milestone scoping and definition
3. Determine milestone structure and naming
4. Create milestone directory and meta file
5. Guide supporting documentation creation
6. Update project manifest with milestone
7. Validate milestone coherence and alignment
8. Report milestone creation and next steps

---

## 1 · Parse arguments and analyze project context

**CRITICAL:** You are given additional Arguments: <$ARGUMENTS>

**USE PARALLEL SUBAGENTS** to do these tasks:

- Parse arguments for suggested milestone name/focus (defaults to interactive creation)
- Read `.simone/00_PROJECT_MANIFEST.md` to understand current project state
- Scan `.simone/02_REQUIREMENTS/` to identify existing milestones and numbering
- Read `.simone/01_PROJECT_DOCS/ARCHITECTURE.md` to understand project scope
- Check latest project review in `.simone/10_STATE_OF_PROJECT/` for current status
- **IMPORTANT:** Understand project phase and what logical next milestone should be

## 2 · Interactive milestone scoping and definition

**Conversational milestone definition:**

If arguments provided:
- "I see you want to create a milestone for: [arguments]"
- "Let me understand the scope better..."

If no arguments:
- "Let's define your next milestone based on the current project state"
- "I see you're currently on [current milestone] - what should we focus on next?"

**Interactive questions (adapt based on context):**
- "What's the main goal of this milestone?"
- "What key deliverables should be completed?"
- "Are there any specific technical challenges or requirements?"
- "How does this milestone advance the project toward its long-term vision?"
- "What would 'done' look like for this milestone?"

**Keep conversational and adaptive** - don't interrogate, just gather what's needed

## 3 · Determine milestone structure and naming

**Generate milestone details:**
- Determine next milestone number (M##) by scanning existing milestones
- Create descriptive milestone name from user input
- Format: `M##_Milestone_Name_Snake_Case`
- **CRITICAL:** Ensure no duplicate milestone numbers
- Validate naming follows Simone conventions (underscores, no spaces)

**Confirm with user:**
- "I'll create milestone: M##_[Name] - does this sound right?"
- Allow user to adjust name or numbering if needed

## 4 · Create milestone directory and meta file

**Create milestone structure:**
- Create directory: `.simone/02_REQUIREMENTS/M##_Milestone_Name/`
- Copy template from `.simone/99_TEMPLATES/milestone_meta_template.md`
- Create milestone meta file: `M##_milestone_meta.md`

**Populate milestone meta file:**
- Fill in YAML frontmatter:
  - `milestone_id: M##`
  - `title: [Milestone Name]`
  - `status: pending`
  - `last_updated: [current timestamp YYYY-MM-DD HH:MM]`
- Convert user input into structured sections:
  - **Goals**: Clear objectives from user discussion
  - **Key Documents**: Placeholder for PRD and SPECS files
  - **Definition of Done**: Specific, measurable criteria from user input
  - **Notes/Context**: Additional context from user discussion

## 5 · Guide supporting documentation creation

**Interactive document planning:**

Based on milestone scope, suggest needed documents:
- "For this milestone, you'll likely need:"
- "□ PRD_[Milestone_Name].md - Product requirements"
- "□ SPECS_[Technical_Area].md - Technical specifications"
- "□ Any domain-specific documentation"

**Ask user:**
- "Would you like me to create starter templates for these documents now?"
- "Or would you prefer to create them manually as needed?"

**If user wants templates created:**
- Create basic PRD template with milestone-specific sections
- Create SPECS template if technical milestone
- Include proper cross-references between documents
- **IMPORTANT:** Don't over-engineer - create useful starting points

**If user prefers manual:**
- Note in milestone meta what documents are expected
- Provide guidance on when/how to create them

## 6 · Update project manifest with milestone

**UPDATE** `.simone/00_PROJECT_MANIFEST.md`:

- Add milestone to milestones section:
  - Format: `- [ ] M##: [Milestone Name] - Status: Planning`
  - Link: `[M##](02_REQUIREMENTS/M##_Milestone_Name/M##_milestone_meta.md)`
- Update project metadata:
  - Set `current_milestone` if this is the active milestone
  - Update `highest_milestone` number
  - Update `last_updated` timestamp
- **IMPORTANT:** Preserve all existing content and formatting

## 7 · Validate milestone coherence and alignment

**VERIFY** milestone quality:

- Check milestone aligns with project architecture and vision
- Ensure Definition of Done is specific and measurable
- Validate milestone scope is appropriate (not too broad/narrow)
- Confirm milestone advances project toward stated goals
- Check milestone numbering and naming follows conventions
- Verify all created files follow template structure
- **CRITICAL:** Milestone should be independently valuable and achievable

**THINK ABOUT**:
- Does this milestone make sense given the current project state?
- Are the goals realistic and well-scoped?
- Is the Definition of Done clear enough to know when it's complete?
- Does this milestone set up future milestones logically?

## 8 · Report milestone creation and next steps

**OUTPUT FORMAT**:

```markdown
✅ **Milestone Created**: M##_[Milestone_Name]

📋 **Milestone Details**:
- ID: M##
- Title: [Milestone Name]
- Status: Planning
- Focus: [One-line summary of main goal]

📚 **Created Documents**:
- Milestone meta: `02_REQUIREMENTS/M##_[Name]/M##_milestone_meta.md`
- [Any additional documents created]

🎯 **Definition of Done**:
- [Key DoD criteria from milestone]

📈 **Project Impact**:
- Updates project from M[previous] to M##
- Advances toward: [project vision alignment]

⏭️ **Recommended Next Steps**:
- Review milestone details: `02_REQUIREMENTS/M##_[Name]/M##_milestone_meta.md`
- Create supporting documentation as planned
- Break down into sprints: `/project:simone:create_sprints_from_milestone M##`
- Update with specific requirements as they become clear

🎯 **Ready for Development**: Use `/project:simone:create_sprints_from_milestone M##` when ready to start implementation planning
```

**IMPORTANT NOTES**:
- Keep milestone scope focused and achievable
- Definition of Done should be measurable
- Supporting documents can be created as needed
- Milestone planning is iterative - refine as you learn more