---
title: Copy workspace settings to other workspaces
description: Learn how Workspace Admins can copy settings from one workspace to one or more existing workspaces in New Expensify.
keywords: [New Expensify, copy settings, copy workspace settings, workspace settings, apply settings to workspaces, workspace admin]
internalScope: Audience is Workspace Admins. Covers how to copy settings from a source workspace onto one or more existing target workspaces, which settings can be copied, and what happens after copying. Does not cover duplicating a workspace to create a new one.
---

# Copy workspace settings to other workspaces

Copy settings lets a Workspace Admin apply the settings from one workspace to one or more of their other existing workspaces. This is useful when you want several workspaces to share the same configuration—such as categories, tags, or workflows—without setting each one up manually. Copying overwrites the selected settings on the workspaces you choose.

Copy settings applies changes to workspaces you already have. To create a brand-new workspace based on an existing one instead, [learn how to duplicate a workspace](/articles/new-expensify/workspaces/Duplicate-Workspace).

---

## Who can copy workspace settings in Expensify

Only **Workspace Admins** can copy settings, and the option is available only when:

- The source workspace is a paid (Collect or Control) group workspace.
- You have at least one other eligible workspace that can receive the copied settings.

Members without admin access won't see the **Copy settings** option in the workspace menu.

Some settings require the target workspaces to be on the Control plan. If a setting you select is only available on Control, you'll be prompted to upgrade the affected workspaces before you can continue.

---

## How to copy workspace settings

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces**.
2. Select the three dots **(⋮)** next to the workspace you want to copy settings from, then select **Copy settings**.
3. On the **Select workspaces** screen, choose the workspaces you want to copy settings to, then select **Next**.
4. On the **Select settings** screen, choose the settings to overwrite on the selected workspaces, then select **Next**. Available settings depend on what is enabled on the source workspace and may include:
   - Profile
   - Currency
   - Members
   - Reports
   - Accounting
   - Categories
   - Tags
   - Taxes
   - Workflows
   - Rules
   - Merchant rules
   - Distance rates
   - Per diem
   - Invoices
   - Travel
   - Time tracking
   - Receipt partners
5. If any selected settings require the Control plan, follow the prompt to upgrade the affected workspaces.
6. Review the summary of the settings that will be copied, then select **Copy settings** to confirm.

<!-- SCREENSHOT:
Suggestion: The workspace three dots (⋮) menu open with the Copy settings option visible.
Location: After step 2.
Purpose: Confirms where the Copy settings option lives so admins don't confuse it with Duplicate workspace.
-->

---

## What happens after you copy workspace settings

- Copying starts and a progress indicator appears. You can either wait for the process to finish or have Concierge notify you when it's done.
- The selected settings overwrite the matching settings on each target workspace.
- When the process completes, Concierge sends you a confirmation message that your workspace settings have been copied.
- The source workspace is not changed.

---

# FAQ

## Does copying settings overwrite existing settings on the target workspaces?

Yes. Copy settings overwrites the settings you selected on each target workspace with the settings from the source workspace.

## What's the difference between copying settings and duplicating a workspace?

Copy settings applies settings to workspaces you already have. Duplicating a workspace creates a new, separate workspace using the settings of an existing one. To create a new workspace, [learn how to duplicate a workspace](/articles/new-expensify/workspaces/Duplicate-Workspace).

## Why don't I see the Copy settings option?

The **Copy settings** option only appears when you are a Workspace Admin of a paid group workspace and you have at least one other eligible workspace to copy settings to. If you have no other eligible workspace, the option won't be shown.

## Why can't I copy certain settings?

Some settings can only be copied when the workspaces are compatible. For example, you can only copy accounting settings if all workspaces use the same accounting system and company connection, you can only copy travel if every selected workspace has a company address, and some settings require the target workspaces to be on the Control plan.
