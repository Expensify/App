---
title: Leave a Workspace
description: Learn how to leave a workspace in New Expensify and what each leave confirmation message means before you go.
keywords: [New Expensify, leave workspace, leave a workspace, remove myself from a workspace, leave workspace approver, approval workflow, reports waiting for my approval, change approver, workspace member, workspace owner, reimburser, preferred exporter, technical contact]
internalScope: Audience is workspace members, workspace admins, and auditors who want to remove themselves from a workspace. Covers how to leave a workspace and what each leave confirmation message means. Does not cover removing other members, deleting a workspace, or transferring workspace ownership.
contentType: task
platform: new-expensify
---

# Leave a Workspace

If you no longer need access to a workspace, you can remove yourself from it. Before you leave, Expensify shows a confirmation message explaining what you'll lose and who takes over the responsibilities assigned to you. Leaving a workspace doesn't delete it, and a workspace admin can invite you back later.

---

## Who can leave a workspace

Any workspace member, workspace admin, or auditor can leave a workspace they don't own.

---

## How to leave a workspace

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Select the three dots **(⋮)** next to the workspace you want to leave.
3. Choose **Leave**.
4. Select **Leave** again to confirm.

---

## What happens after you leave a workspace
 - You lose access to the workspace and can no longer perform the actions your workspace role allowed.
 - Expenses you already submitted on the workspace remain visible to its admins and auditors.
 - A workspace admin can invite you back at any time.

---

## What happens to your workspace role after you leave

What happens to your responsibilities depends on your role:

 - **Technical Contact** – The workspace owner replaces you as the Technical Contact.
 - **Preferred exporter** – The workspace owner replaces you as the preferred exporter.
 - **Approver** – The workspace owner replaces you in the approval workflow. Reports waiting for your approval are also reassigned to the workspace owner.
 - **Workspace admin** – You are not replaced automatically. You can no longer manage the workspace's settings.
 -** Auditor** – You are not replaced automatically. You can no longer view the workspace's reports and settings.
 - **Member** – You are not replaced automatically. You can no longer submit expenses to the workspace.

---

# FAQ

## Why can't I leave my workspace?

You're the workspace owner, or you're set as the workspace's reimburser. Owners don't see a **Leave** option at all — transfer ownership or delete the workspace instead. If you're the reimburser, you see a message asking you to assign a new reimburser first.

## What happens to reports waiting for my approval when I leave a workspace?

They're reassigned to the workspace owner, and a system message in each report confirms the reassignment. This is the same behavior that applies when a workspace admin removes an approver from the workspace.

## Why do I see the approver message when I'm not in the approval workflow?

At least one report in the workspace is still waiting for your approval — usually because a workspace admin routed it to you with **Change approver**. Expensify checks the reports actually pending with you, not only the workspace's configured approval workflow, so it can tell you those reports will move to the workspace owner.
