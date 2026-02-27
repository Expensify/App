# Expensify Naming and Navigation Conventions

## Purpose

This document defines mandatory rules for referencing UI elements, buttons, tabs, icons, menus, and navigation patterns in Expensify HelpDot articles.

All HelpDot articles must comply.

This document governs UI language conventions. It does not define article structure or Markdown formatting rules. Those are defined in:

docs/HELP_AUTHORING_GUIDELINES.md

---

# Core UI Referencing Rules

When referencing UI elements:

- Use the exact text shown in the product UI.
- Match capitalization exactly.
- Do not paraphrase labels.
- Do not shorten labels.
- Do not invent synonyms.
- Do not generalize UI elements.

If the UI changes, this document must be updated.

---

# Button Naming Standards

## Formatting Requirements

- Bold all button names using **bold formatting**.
- Use Sentence case (match the UI exactly).
- Do not wrap button names in quotation marks.
- Do not alter capitalization.
- Do not substitute synonyms.

Correct:
- Click **Save**.
- Select **Confirm**.
- Tap **Next**.

Incorrect:
- Click Save.
- Click “Save”.
- Click **SAVE**.
- Select confirm.
- Click **Continue** (when the button is **Next**).

---

# Tab Naming Standards

- Bold all tab names using **bold formatting**.
- Use the exact tab name shown in the UI.
- Do not wrap tab names in quotation marks.
- Do not paraphrase tab names.

Correct:
- Select **Chat**.
- Open **Workspaces**.
- Go to **Settings**.

Incorrect:
- Select “Chat”.
- Go to Chat.
- Open Workspace (when the tab is **Workspaces**).

---

# Three Dots Menu Rule

When referencing the three dots menu, always write:

Select the three dots **(⋮)**.

Formatting requirements:

- Always include the visual symbol inside parentheses: **(⋮)**
- Always bold the symbol.
- Always include the words “three dots” before the symbol.
- Do not wrap in quotation marks.
- Do not call it “More”.
- Do not write “More menu”.

Incorrect:
- Click More
- Select “: More”
- Tap the three dots
- Open the More menu
- Click ⋮

Correct:
- Select the three dots **(⋮)**.
- Click the three dots **(⋮)** next to the expense.

---

# Navigation Instruction Standards

Follow the platform decision hierarchy below.

---

## If Web and Mobile Navigation Differ

Provide separate instructions.

Web:  
Use the navigation tabs on the left.

Mobile:  
Use the navigation tabs on the bottom.

Do not merge these into one sentence.

---

## If Web and Mobile Navigation Are Structurally the Same

Use a unified sentence:

Click the navigation tabs (on the left on web, on the bottom on mobile).

Do not duplicate instructions unnecessarily.

---

## Hamburger Menu Rule (Mobile Only)

If access requires the hamburger menu, always write:

On mobile, tap the hamburger menu in the top-left corner, then select **[Tab name]**.

Rules:

- Do not paraphrase this sentence.
- Always specify “top-left corner”.
- Always bold the tab name.
- Do not use quotation marks.

---

## If a Feature Is Not Available on Mobile

State clearly:

This feature is not available on mobile.

Do not soften or imply this limitation.

---

# Section and Toggle References

## Sections

- Use the exact section header text shown in the UI.
- Do not generalize section names.
- Do not paraphrase.

---

## Toggles

- Use the exact toggle label shown in the UI.
- Bold toggle names if they appear as clickable UI elements.
- Do not reword toggle labels.

Example:
- Enable **Reimbursements**.
- Turn on **Company Cards**.

---

# Breadcrumb Referencing Rule

When referencing breadcrumbs inside instructions:

- Breadcrumbs must follow the formatting rules defined in:
  /docs/HELPSITE_NAMING_CONVENTIONS.md
- Do not paraphrase breadcrumb labels.
- Do not modify breadcrumb structure.

---

# Cross-Platform Clarity Rule

When platform differences impact behavior:

- Explicitly state the platform.
- Do not assume parity.
- Do not imply identical behavior unless confirmed.

If UI text differs between platforms:

- Specify which platform uses which label.

If layout differs but labels are identical:

- Follow the Navigation Instruction Standards.

---

# Prohibited Language

Do not use vague navigation phrases:

- “Click the three dots”
- “Open the menu”
- “Navigate to the area”
- “Go to the section”
- “Find the setting”
- “The options button”

Always reference the exact UI label or icon.

---

# Deterministic Writing Rule

When referencing UI elements:

- Be literal.
- Be exact.
- Be consistent.
- Avoid stylistic variation.

Clarity and precision take precedence over prose style.
