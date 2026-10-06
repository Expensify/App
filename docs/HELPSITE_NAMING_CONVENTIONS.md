# Expensify Naming and Navigation Conventions

## Purpose

This document defines mandatory rules for referencing UI elements, buttons, tabs, icons, menus, colors, and navigation patterns in Expensify HelpDot articles.

**Source of truth:** `src/languages/en.ts` and the production UI.

All HelpDot articles must comply.

This document governs UI language and capitalization conventions. It does not define article structure or Markdown formatting rules. Those are defined in:

docs/HELP_AUTHORING_GUIDELINES.md

Note: All article headings (# and ##) must follow the task-based heading rules in HELP_AUTHORING_GUIDELINES.md Section 2, except for `# FAQ` which is exempt. This includes section headings that reference UI features — they must still be task-based, not just feature labels. Heading capitalization is defined in [Article Titles and Headings](#article-titles-and-headings) below.

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

## Actions

### Select or choose

Use the verb that matches the action, not the device.

| Verb | Use when | Example |
| --- | --- | --- |
| **select** | Default for interacting with any UI element. Works across web, mobile, touch, mouse, and keyboard. | Select **Save**. |
| **choose** | The member is making a decision between multiple options, not activating a UI element. | Choose **Vendor bill** or **Journal entry**. |

> **Examples:**
>
> Correct:
>
> - Select **Workspaces**.
> - Select **Next**.
> - Choose a default currency.
>
> Incorrect:
>
> - Click **Save**.
> - Tap **Next**.
> - Choose **Save**. (use **select** — this activates a button, not a decision)
> - Hit, press, or push a button.

## Button Naming Standards

### Bolded and matches the UI exactly

- Bold all button names using **bold formatting**.
- Use sentence case (match the UI exactly).
- Do not wrap button names in quotation marks.
- Do not alter capitalization.
- Do not substitute synonyms.

> **Examples:**
>
> Correct:
>
> - Select **Save**.
> - Select **Confirm**.
> - Select **Next**.
>
> Incorrect:
>
> - Select Save.
> - Select “Save”.
> - Select **SAVE**.
> - Confirm your selection

---

## Navigation Tabs

### The LHN is referred to as "the navigation tabs"

The primary navigation (**Home**, **Inbox**, **Spend**, **Workspaces**, **Account**) is called the **navigation tabs**.

- Use "in the navigation tabs" only when you need to reference the primary navigation directly.
- Bold each tab name and use the exact name shown in the UI.
- Do not wrap tab names in quotation marks.
- Do not paraphrase tab names.
- The only position description allowed is this exact parenthetical: **(on the left on web, on the bottom on mobile)**. Use it when members may need help finding the tabs. Do not use any other position wording.

> **Examples:**
>
> Correct:
>
> - In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
> - [if web-only] In the navigation tabs on the left, select **Workspaces**.
> - [if mobile-only] In the navigation tabs on the bottom, select **Workspaces**.
>
> Incorrect:
>
> - On the navigation tabs
> - Open Workspace (when the tab is **Workspaces**).
> - Tap **Spend** from the navigation tabs on the bottom
> - Select **Spend** in the left sidebar.

---

## Navigation Paths

### Workspaces > [workspace name] > Members

Use a navigation path instead of naming the navigation menu.

- Start the path with the navigation tab.
- Separate each level with `>`.
- Bold the entire path.
- Capitalize each segment exactly as it appears in the UI.
- Include a lowercase bracketed placeholder for variable names: **[workspace name]**, **[domain name]**.

> **Examples:**
>
> Correct:
>
> - Select **Workspaces > [workspace name] > Members**.
> - Select **Spend > Expenses**.
> - Select **Account > Settings**.
> - Navigate to **Spend > Reports**.
>
> Incorrect:
>
> - Select **Workspaces > Members**. (include the placeholder)
> - Select **Workspaces > [Workspace Name] > Members**. (lowercase the placeholder)
> - In the workspace menu, select **Members**.
> - In the Spend sidebar, select **Expenses**.
> - Open the settings menu and select **Preferences**.
> - Select **Workspaces**, then **[workspace name]**, then **Members**. (use a path)

## Navigation Menu

### The menu nested under the LHN is the "navigation menu"

The **navigation menu** is the secondary menu inside a navigation tab, such as the list of **Members**, **Workflows**, and **Categories** inside a workspace. Use this name on all platforms.

- Prefer a navigation path. Only reference the navigation menu directly if continuing previous steps where a navigation path was already provided.
- Do not call it the sidebar, workspace, account menu, etc.

> **Examples:**
>
> Correct:
>
> - In the navigation menu, select **Rules**.
> - In the navigation menu, select **Subscription**.
>
> Incorrect:
>
> - Inside your workspace, select **Rules**.
> - Go to Subscription under **Account**.
> - In the workspace sidebar, select **Workflows**.

---

## Three Dots Menu

### Select **More (⋮)**

When referencing the three dots menu, always write: Select **More (⋮)**

- Always include the visual symbol inside parentheses: **(⋮)**
- Always bold the symbol.
- Always include the word “**More**” before the symbol.
- Do not wrap in quotation marks.

> **Examples:**
>
> Correct:
>
> - Select **More (⋮)**.
> - Select **More (⋮)** next to the workspace.
>
> Incorrect:
>
> - Tap the three dots (⋮)
> - Open the three dots menu
> - Click ⋮

---

## Platform Instructions

### If web and mobile navigation are the same, combine instructions

Write one set of instructions. Do not duplicate steps.

> **Example:**
>
> - In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces > [workspace name] > Members**.

### If web and mobile navigation differ, provide separate labeled instructions

> **Example:**
>
> On web:
>
> 1. In the navigation tabs on the left, select **Spend > Insights > Top spenders**.
>
> On mobile:
>
> 1. In the navigation tabs on the bottom, select **Spend**.
> 2. Select the navigation menu to open it.
> 3. Select **Insights**.

**If a feature isn't available on a platform**, name the platform where it is available, not the device or channel. Use **web** and **mobile**, not “Web,” “website,” “desktop,” or "app" on their own.

> **Examples:**
>
> Correct:
>
> - This feature is only available on web. It isn't available on mobile.
> - This feature is only available on mobile. It isn’t available on web.
>
> Incorrect:
>
> - This feature is only available on the web.
> - Use the website to do this.
> - This isn't supported on desktop.
> - Manage this from web.

---

## Toggle References

### Use the exact UI label and say "enable" or "disable" when adjusting

- Refer to a toggle using its exact label shown in the UI.
- Bold toggle names if they appear as clickable UI elements.
- Do not reword toggle labels.
- Toggle actions are limited to "enable" or "disable."

> **Examples:**
>
> Correct:
>
> - Enable **Per diem**.
> - Disable **Company cards**.
>
> Incorrect:
>
> - Turn on **Per Diem**
> - Disable the Company Cards toggle

---

## Section References

- Use the exact section header text shown in the UI.
- Do not generalize section names.
- Do not paraphrase.

---

## Name UI Elements by Function

### Name UI elements by what they do, not what they look like or where they happen to be

| Write | Not |
| --- | --- |
| Search icon | magnifying glass |
| Delete icon | trash can |
| selection bar | the bar at the bottom, the bulk selection bar |
| navigation menu | hamburger menu, three lines, sidebar |

---

## Fields

### Use **field** for any text-entry control, including search boxes, text boxes, and inputs

- Bold the field's label and follow it with "field."
- Use the exact label shown in the UI.
- For the search control, write "search field" (lowercase, not bold) unless it has a visible label.

> **Examples:**
>
> Correct:
>
> - Enter a comment in the **Description** field.
> - Enter the merchant name in the **Merchant** field.
> - Type the member's name in the search field.
>
> Incorrect:
>
> - Type in the Description box.
> - Fill in the Merchant input.
> - Use the search bar.
> - Enter a value in the text box.

---

## Bulk Actions Menu

### The bulk actions menu is called the "selection bar"

- Call it the selection bar (lowercase).
- Do not bold the menu name.
- Do not describe its position or color.

> **Examples:**
>
> Correct:
>
> - Select the reports, then select **Export** from the selection bar.
> - Select the expenses, then select **Delete** from the selection bar.
>
> Incorrect:
>
> - Select the reports, then select **Export** from the bar at the bottom.
> - Use the bulk actions menu to export.
> - Select the checkbox, then select the green button.

---

## Color References

### Only reference color when required as a secondary descriptor

Don't use color as the only way to identify a UI element. When color communicates meaningful status, include it as a secondary descriptor alongside the element name.

> **Examples:**
>
> Correct:
>
> - Select the company card with the red dot.
> - A red dot means there’s a connection error.
> - When a request is pending, a green dot appears next to **Domain admins**.
>
> Incorrect:
>
> - Click the green receipt button
> - Group participants are listed with a green checkmark.
> - Look for the green button at the top.

---

## Cross-Platform Clarity Rule

When platform differences impact behavior:

- Explicitly state the platform.
- Do not assume parity.
- Do not imply identical behavior unless confirmed.

If UI text differs between platforms:

- Specify which platform uses which label.

If layout differs but labels are identical:

- Follow the [Platform Instructions](#platform-instructions) rules.

---

## Prohibited Language

Do not use vague navigation phrases:

- “Click the three dots”
- “Open the menu”
- “Navigate to the area”
- “Go to the section”
- “Find the setting”
- “The options button”

Always reference the exact UI label, icon, or navigation path.

---

# Writing and Capitalization

## Core Capitalization Rules

- Use title case for article titles.
- Use sentence case everywhere else.
- When referring to UI elements, match the UI casing exactly.
- Use all caps for acronyms.
- When quoting the UI, match its capitalization exactly.
- Capitalize branded names as defined in [src/languages/en.ts](https://github.com/Expensify/App/blob/main/src/languages/en.ts).
- Capitalize proper nouns.

> **Examples:**
>
> Correct:
>
> - BYOC
> - Select **Add approval workflow**
>
> Incorrect:
>
> - Byoc
> - Select **Add Approval Workflow**

---

## Article Titles and Headings

- Use title case for the article title: the frontmatter `title` and the `#` title.
- Use sentence case for every `##` heading.
- Capitalize proper nouns and product names inside headings.
- `# FAQ` is always written in all caps as an acronym.

> **Examples:**
>
> Correct:
>
> - `# Configure NetSuite Settings in Expensify`
> - `## Who can configure NetSuite settings`
>
> Incorrect:
>
> - `# Configure NetSuite settings in Expensify`
> - `## Who Can Configure NetSuite Settings`

---

## Roles

### Capitalize roles only when quoting a UI label

- Use lowercase roles in running text.
- Capitalize a role only when quoting a UI label.
- Do not capitalize a role to signal importance.

**Role names:**

- workspace admin
- workspace owner
- domain admin
- account manager
- account executive
- partner manager
- member

> **Examples:**
>
> Correct:
>
> - Only the workspace owner can manage the payment card.
> - Ask your domain admin to add the domain.
> - Chat with your account manager.
> - Choose **Workspace admin** from the list of roles.
>
> Incorrect:
>
> - Only the Workspace Owner can manage the payment card.
> - Only the Workspace owner can manage the payment card.
> - Ask your Domain Admin to add the domain.

---

## Generic Terms

### Always lowercase, except when referencing a UI label directly

Lowercase these in running text, even when the matching tab is capitalized:

- workspace / workspaces
- report / reports
- expense / expenses
- expense report
- invoice / invoices
- company card / company cards
- per diem / per diem rates
- workflow / approval workflow
- subscription
- plan
- cash back
- realtime
- expense management
- spend management
- bill pay

> **Examples:**
>
> Correct:
>
> - Each workspace has one workspace owner.
> - You can configure how company card purchases export.
> - Set per diem rates to control daily employee spend.
>
> Incorrect:
>
> - Every Workspace has one Workspace Owner.
> - You can configure Company Card purchases export.
> - Set Per Diem rates.
> - Use Bill Pay to pay vendors.

---

## Plans and Subscriptions

### Capitalize plan names

- Capitalize the plan name. Lowercase the word "plan."
- Lowercase subscription types in running text.
- Match the UI when quoting subscription options.

> **Examples:**
>
> Correct:
>
> - Upgrade to the Control plan.
> - Your workspace is on the Collect plan.
> - Sign up for an annual subscription.
> - Select **Annual** or **Pay-per-use**.
>
> Incorrect:
>
> - Upgrade to the Control Plan.
> - Your workspace is on the control plan.
> - Sign up for an Annual Subscription.
> - Select annual or pay-per-use.

---

# Deterministic Writing Rule

When referencing UI elements:

- Be literal.
- Be exact.
- Be consistent.
- Avoid stylistic variation.

Clarity and precision take precedence over prose style.
