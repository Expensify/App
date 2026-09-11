---
title: Copy Workspace Settings
description: Learn how Workspace Admins can copy settings from one workspace to one or more existing workspaces in New Expensify.
keywords: [New Expensify, copy settings, copy workspace settings, workspace settings, apply settings to workspaces, workspace admin]
internalScope: Audience is Workspace Admins. Covers how to copy settings from a source workspace onto one or more existing destination workspaces, which settings can be copied, and what happens after copying. Does not cover duplicating a workspace to create a new one.
---

# Copy Workspace Settings

Workspace Admins can copy settings from one workspace to another workspace they're an admin on. This helps keep multiple workspaces configured consistently without updating each one manually.

The selected settings overwrite the corresponding settings in the destination workspaces.

To create a new workspace using an existing workspace as a template, learn how to [duplicate a workspace](/articles/new-expensify/workspaces/Duplicate-Workspace).

---

## Who can copy workspace settings in Expensify

Only Workspace Admins can copy settings. The **Copy settings** option is available only if you're a Workspace Admin on two or more Collect or Control workspaces.

Some settings require the destination workspaces to be on the Control plan. If a setting you select is only available on Control, you'll be prompted to upgrade the affected workspaces before you can continue.

---

## How to copy workspace settings

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces**.
2. Select the three dots **(⋮)** next to the workspace you want to copy settings from, then select **Copy settings**.
3. On the **Select workspaces** page, choose the workspaces you want to copy settings to, then select **Next**.
4. On the **Select settings** page, choose the settings to copy to the selected workspaces, then select **Next**. Available settings depend on what is enabled on the source workspace. 
5. Review the summary of the settings that will be copied, then select **Copy settings** to confirm.

![The workspace three dots (⋮) menu open with the Copy settings option visible]({{site.url}}/assets/images/Workspaces_copy_settings.png){:width="100%"}

---

## What happens after you copy workspace settings

After you select **Copy settings**:

- The selected settings overwrite the corresponding settings in each destination workspace.
- When the process completes, Concierge sends you a confirmation message that your workspace settings have been copied.
- The source workspace is not changed.

---

# FAQ

## Does copying settings overwrite existing settings on the destination workspaces?

Yes. Any settings you select replace the corresponding settings in each destination workspace.

## What's the difference between copying settings and duplicating a workspace?

Copy settings applies settings to workspaces you already have. Duplicating a workspace creates a new, separate workspace using the settings of an existing one. To create a new workspace, [learn how to duplicate a workspace](/articles/new-expensify/workspaces/Duplicate-Workspace).

## Why don't I see the Copy settings option?

The Copy settings option is available only if you're a Workspace Admin on two or more Collect or Control workspaces. 

## Why can't I copy certain settings?

Some settings can only be copied when the workspaces are compatible. For example, you can only copy accounting settings if all workspaces use the same accounting system and company connection, you can only copy travel if every selected workspace has a company address, and some settings require the destination workspaces to be on the Control plan.

[Learn about the differences between the Collect and Control plans](/articles/new-expensify/billing-and-subscriptions/explore-plans-subscriptions-and-pricing/Compare-Collect-and-Control-Plans#common-feature-differences-between-collect-and-control).
