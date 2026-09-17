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

## Who can leave a workspace

Any workspace member, workspace admin, or auditor can leave a workspace they don't own.

The workspace owner can't leave their own workspace. To remove yourself as the owner, transfer ownership to another admin first, or delete the workspace instead. Learn how to [transfer workspace ownership](/articles/new-expensify/workspaces/Managing-Workspace-Members) or [delete a workspace](/articles/new-expensify/workspaces/Delete-a-Workspace).

You also can't leave a workspace while you're set as its reimburser. See the confirmation messages below for what to do first.

## How to leave a workspace from the Workspaces list

1. In the navigation tabs (on the left on web, on the bottom on mobile), click **Workspaces**.
2. Select the three dots **(⋮)** next to the workspace you want to leave.
3. Choose **Leave**.
4. Read the confirmation message, then click **Leave**.

To stay in the workspace instead, click **Cancel**.

## How to leave a workspace from the workspace Overview page

1. In the navigation tabs (on the left on web, on the bottom on mobile), go to **Workspaces > [workspace name] > Overview**.
2. Click **More**.
3. Choose **Leave**.
4. Read the confirmation message, then click **Leave**.

## What each leave confirmation message means

The confirmation window is titled **Leave [workspace name]?**. You'll see one message, based on the highest-priority responsibility you hold in that workspace, in this order:

- **Reimburser** – "You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again." This message has a single **Got it** button and doesn't let you leave. Assign a new reimburser, then try again.
- **Technical contact** – You'll be replaced as the technical contact by the workspace owner.
- **Preferred exporter** – You'll be replaced as the preferred exporter by the workspace owner.
- **Approver** – You'll be replaced in the approval workflow by the workspace owner.
- **Workspace admin** – You won't be able to manage the workspace's settings.
- **Auditor** – You won't be able to view the workspace's reports and settings.
- **Member** – You won't be able to submit expenses to the workspace.

## When you see the approver message

You see the approver message if either of the following is true:

- You're set as an approver in the workspace's approval workflow.
- At least one report in the workspace is currently waiting for your approval, even when you aren't part of the workspace's approval workflow. This includes a report a workspace admin routed to you with **Change approver**.

Because those reports still need an approval before they can be paid, the message names the workspace owner as the person who replaces you. Learn more about [automatic approver reassignment](/articles/new-expensify/workspaces/Add-Approvals).

## What happens after you leave a workspace

- You lose the access your role gave you, so you can no longer submit expenses to the workspace or open its settings.
- Reports that were waiting for your approval are reassigned to the workspace owner.
- Expenses you already submitted stay with the workspace and remain visible to its admins and auditors.
- A workspace admin can invite you back at any time.

# FAQ

## Why can't I leave my workspace?

You're the workspace owner, or you're set as the workspace's reimburser. Owners don't see a **Leave** option at all — transfer ownership or delete the workspace instead. If you're the reimburser, you see a message asking you to assign a new reimburser first.

## What happens to reports waiting for my approval when I leave a workspace?

They're reassigned to the workspace owner, and a system message in each report confirms the reassignment. This is the same behavior that applies when a workspace admin removes an approver from the workspace.

## Why do I see the approver message when I'm not in the approval workflow?

At least one report in the workspace is still waiting for your approval — usually because a workspace admin routed it to you with **Change approver**. Expensify checks the reports actually pending with you, not only the workspace's configured approval workflow, so it can tell you those reports will move to the workspace owner.
