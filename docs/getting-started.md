# Getting Started

This guide explains how OfficeSpec works after you've installed and initialized it. For installation instructions, see the [main README](../README.md#quick-start) or the [Installation guide](installation.md). New to the whole docs set? The [documentation home](README.md) maps everything.

> **Where do I type these commands?** Two places, and mixing them up is the most common early stumble.
>
> - `openspec ...` commands (like `openspec init`) run in your **terminal**.
> - `/ofsx:...` commands (like `/ofsx:propose`) run in your **AI assistant's chat**, the same box where you'd ask it to do the work.
>
> There's no separate "interactive mode" to start. You just type the slash command in chat and your assistant takes it from there. Full explanation: [How Commands Work](how-commands-work.md).

## Your First Five Minutes

The whole loop, with each step labeled by where it happens:

```text
TERMINAL   $ npm install -g officespec@latest
TERMINAL   $ cd your-work-folder && openspec init
AI CHAT      /ofsx:explore                    (optional: think it through first)
AI CHAT      /ofsx:propose improve-expense-approvals      (AI drafts the plan; you review it)
AI CHAT      /ofsx:apply                      (AI helps you do it)
AI CHAT      /ofsx:archive                    (specs updated, change filed away)
```

Two terminal steps to set up, then you live in chat. The rest of this guide unpacks what each step does and what you'll see.

**Don't want to do the terminal part yourself?** Paste the [setup prompt](installation.md#install-with-your-ai-assistant) into your assistant and it handles both lines, then reports what it created.

> **Not sure what to change yet? Start with `/ofsx:explore`.** It's a no-stakes thinking partner that reads your workspace, weighs options, and sharpens a fuzzy idea into a concrete plan, all before any artifact or code exists. When the picture is clear, it hands off to `/ofsx:propose`. This is the single best habit for working with an AI that will otherwise confidently do the wrong thing. See the [Explore guide](explore.md).

## How It Works

OfficeSpec helps you and your AI AI assistant agree on what to do before any work starts.

**Default quick path (core profile):**

```text
/ofsx:explore ──► /ofsx:propose ──► /ofsx:apply ──► /ofsx:sync ──► /ofsx:archive
   (optional)
```

Start with `/ofsx:explore` when you're figuring out what to do, or jump straight to `/ofsx:propose` when you already know. Explore is in the default profile, so it's always there when you want it.

**Expanded path (custom workflow selection):**

```text
/ofsx:new ──► /ofsx:ff or /ofsx:continue ──► /ofsx:apply ──► /ofsx:verify ──► /ofsx:archive
```

The default global profile is `core`, which includes `propose`, `explore`, `apply`, `update`, `sync`, and `archive`. You can enable the expanded workflow commands with `openspec config profile` and then `openspec update`.

## What OfficeSpec Creates

After running `openspec init`, your work has this structure:

```
openspec/
├── specs/              # Source of truth (your system's behavior)
│   └── <domain>/
│       └── spec.md
├── changes/            # Proposed updates (one folder per change)
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # Delta specs (what's changing)
│           └── <domain>/
│               └── spec.md
└── config.yaml         # Project configuration (optional)
```

**Two key directories:**

- **`specs/`** - The source of truth. These specs describe how your work currently runs. Organized by domain (e.g., `specs/finance/`, `specs/hiring/`).

- **`changes/`** - Proposed modifications. Each change gets its own folder with all related artifacts. When a change is complete, its specs merge into the main `specs/` directory.

## Understanding Artifacts

Each change folder contains artifacts that guide the work:

| Artifact | Purpose |
|----------|---------|
| `proposal.md` | The "why" and "what" - captures intent, scope, and approach |
| `specs/` | Delta specs showing ADDED/MODIFIED/REMOVED requirements |
| `design.md` | The "how" - approach and plan and architecture decisions |
| `tasks.md` | Action checklist with checkboxes |

**Artifacts build on each other:**

```
proposal ──► specs ──► design ──► tasks ──► do
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            update as you learn
```

You can always go back and refine earlier artifacts as you learn more while doing the work.

## How Delta Specs Work

Delta specs are the key concept in OfficeSpec. They show what's changing relative to your current specs.

### The Format

Delta specs use sections to indicate the type of change:

```markdown
# Delta for Expense approvals

## ADDED Requirements

### Requirement: Expense status tracking
The process MUST show the status of every expense request.

#### Scenario: Status visible
- GIVEN a submitted expense request
- WHEN the requester opens the tracker
- THEN the current step and next owner are shown

## MODIFIED Requirements

### Requirement: Session Timeout
The process SHALL expire sessions after 30 minutes of inactivity.
(Previously: 60 minutes)

#### Scenario: Idle timeout
- GIVEN an authenticated session
- WHEN 30 minutes pass without activity
- THEN the session is invalidated

## REMOVED Requirements

### Requirement: Remember Me
(Deprecated in favor of 2FA)
```

### What Happens on Archive

When you archive a change:

1. **ADDED** requirements are appended to the main spec
2. **MODIFIED** requirements replace the existing version
3. **REMOVED** requirements are deleted from the main spec

The change folder moves to `openspec/changes/archive/` for audit history.

## Example: Your First Change

Let's walk through adding dark mode to an application.

### 1. Start the Change (Default)

```text
You: /ofsx:propose improve-expense-approvals

AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md — why we're doing this, what's changing
     ✓ specs/       — requirements and scenarios
     ✓ design.md    — approach and plan
     ✓ tasks.md     — action checklist
     Ready to do the work!
```

If you've enabled the expanded workflow profile, you can also do this as two steps: `/ofsx:new` then `/ofsx:ff` (or `/ofsx:continue` incrementally).

### 2. What Gets Created

**proposal.md** - Captures the intent:

```markdown
# Proposal: Add Dark Mode

## Intent
Users have requested a dark mode option to reduce eye strain
during nighttime usage.

## Scope
- Add theme toggle in settings
- Support system preference detection
- Persist preference in localStorage

## Approach
Use CSS custom properties for theming with a React context
for state management.
```

**specs/ui/spec.md** - Delta showing new requirements:

```markdown
# Delta for UI

## ADDED Requirements

### Requirement: Theme Selection
The process SHALL allow users to choose between light and dark themes.

#### Scenario: Manual toggle
- GIVEN a user on any page
- WHEN the user clicks the theme toggle
- THEN the theme switches immediately
- AND the preference persists across sessions

#### Scenario: System preference
- GIVEN a user with no saved preference
- WHEN the application loads
- THEN the process's preferred color scheme is used
```

**tasks.md** - Action checklist:

```markdown
# Tasks

## 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state
- [ ] 1.2 Add CSS custom properties for colors
- [ ] 1.3 Implement localStorage persistence

## 2. UI Components
- [ ] 2.1 Create ThemeToggle component
- [ ] 2.2 Add toggle to settings page
- [ ] 2.3 Update Header to include quick toggle

## 3. Styling
- [ ] 3.1 Define dark theme color palette
- [ ] 3.2 Update components to use CSS variables
```

### 3. Implement

```
You: /ofsx:apply

AI:  Working through tasks...
     ✓ 1.1 Created ThemeContext with light/dark state
     ✓ 1.2 Added CSS custom properties to globals.css
     ✓ 1.3 Implemented localStorage persistence
     ✓ 2.1 Created ThemeToggle component
     ...
     All tasks complete!
```

During implementation, if you discover the design needs adjustment, just update the artifact and continue.

### 4. Archive

```
You: /ofsx:archive

AI:  Archiving add-dark-mode...
     ✓ Merged specs into openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/
     Done! Ready for the next feature.
```

Your delta specs are now part of the main specs, documenting how your system works.

## Verifying and Reviewing

Use the CLI to check on your changes:

```bash
# List active changes
openspec list

# View change details
openspec show add-dark-mode

# Validate spec formatting
openspec validate add-dark-mode

# Interactive dashboard
openspec view
```

## Next Steps

- [Explore First](explore.md) - Use `/ofsx:explore` to think through an idea before you commit
- [Reviewing a Change](reviewing-changes.md) - What to check in the plan the AI drafts, before any code
- [Writing Good Specs](writing-specs.md) - What a strong requirement and scenario look like
- [Using OfficeSpec in an Existing Project](existing-projects.md) - Start on a large work already in flight
- [Editing & Iterating on a Change](editing-changes.md) - Update artifacts, go back, reconcile manual edits
- [Core Concepts at a Glance](overview.md) - The whole mental model on one page
- [Examples & Recipes](examples.md) - Real changes, start to finish
- [Workflows](workflows.md) - Common patterns and when to use each command
- [Commands](commands.md) - Full reference for all slash commands
- [Concepts](concepts.md) - Deeper understanding of specs, changes, and schemas
- [Customization](customization.md) - Make OfficeSpec work your way
- [Stores](stores-beta/user-guide.md) - Planning that spans repos or teams? Keep it in its own repo (beta)
- [FAQ](faq.md) and [Troubleshooting](troubleshooting.md) - When you get stuck
