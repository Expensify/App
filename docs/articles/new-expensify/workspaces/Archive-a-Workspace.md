---
title: Archive a Workspace
description: Learn how a workspace owner can archive a workspace they no longer need, what happens to its data, members, cards, and billing, and how to unarchive it.
keywords: [archive workspace, archive a workspace, unarchive workspace, delete workspace, delete a workspace, remove workspace, archived workspace, workspace owner, billing owner, end billing, annual subscription, cancel workspace, read-only workspace]
internalScope: Audience is workspace owners, workspace admins, and auditors. Covers how to archive and unarchive a workspace, what happens after a workspace is archived, how to find archived workspaces, and how archiving affects billing. Does not cover transferring workspace ownership, canceling a subscription, or closing an Expensify account.
contentType: task
platform: new-expensify
---

# Archive a Workspace

If you no longer need a workspace, the workspace owner can archive it. Archiving replaces deleting a workspace. An archived workspace is removed from your active workspace lists, shows **(Archived)** after its name, and becomes read-only. Nothing is permanently deleted, and the workspace owner can unarchive it at any time.

---

## Who can archive a workspace

Only the workspace owner can archive a workspace. You can archive a workspace at any time, on any plan, including a workspace on an annual subscription.

To learn more about the workspace owner role, see [What is a Workspace Owner](/articles/new-expensify/billing-and-subscriptions/Learn-About-Billing-Permissions#what-is-a-workspace-owner).

---

## How to archive a workspace

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Select **More (⋮)** next to the workspace you want to archive.
3. Select **Archive workspace**.
4. Review the confirmation message, then select **Archive workspace**.

You can also archive a workspace from inside it. Select **Workspaces > [workspace name]**, select **More**, then select **Archive workspace**.

If the workspace has cards, the confirmation message explains what happens to them:

- **Company cards:** "Are you sure you want to archive this workspace? This will unassign all credit cards from users and permanently delete any unsubmitted card expenses." The card connection stays active with no cards assigned.
- **Expensify Cards:** "Are you sure you want to archive this workspace? This will set all Expensify Card limits to $0 and automatically decline any new purchase attempts."

Unassigned cards, deleted unsubmitted card expenses, and $0 card limits aren't restored if you unarchive the workspace.

---

## What happens after you archive a workspace

After you archive a workspace:

- The workspace moves to the **Archived** section of the **Workspaces** tab, and **(Archived)** is added to its name. Only billing owners, workspace admins, and auditors can access it.
- Members stay on the workspace, so reports stay linked to the members who submitted them. Members who aren't workspace admins or auditors no longer see the workspace in their **Workspaces** list.
- An **archived this workspace** message is posted to the #admins room as part of the workspace audit log.
- Reimbursement bank accounts stay connected, but reports in an archived workspace can't be paid — the **Pay** button is disabled. Unarchive the workspace to resume reimbursing or move the report to an active workspace.
- Accounting and HR integrations stay connected, but nothing updates, including API updates from connections you set up.
- No errors or red dots (RBRs) appear for the workspace while it's archived. If a connection breaks while the workspace is archived, the error appears only after the workspace is unarchived.
- You can't set an archived workspace as your default workspace. This matters most for workspace groups, where most members can't reach archived workspaces at all.
- Reports on the workspace become read-only. You can still find them on the **Spend** page, export them, and move them to an active workspace. [Learn what actions are available on reports in an archived workspace](/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions).

---

## How to find archived workspaces in the Workspaces tab

The **Workspaces** tab shows only active workspaces by default.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Select **Workspace status**.
3. Choose **Archived**, or choose both **Active** and **Archived**.

Billing owners, workspace admins, and auditors always see the **Workspace status** filter, even if there are no archived workspaces. The filter resets each time you leave the page, so the **Workspaces** tab always opens on active workspaces.

---

## What you can do with an archived workspace

When you select **More (⋮)** next to an archived workspace, the options depend on your role:

- **Workspace owner:** **Go to workspace** and **Unarchive**
- **Workspace admin:** **Go to workspace** and **Transfer owner**
- **Auditor:** **Go to workspace**

Selecting an archived workspace opens it in read-only mode. You can view every workspace setting, but you can't change anything.

---

## How to unarchive a workspace

Only the workspace owner can unarchive a workspace.

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Select **Workspace status**, then choose **Archived**.
3. Select **More (⋮)** next to the workspace you want to unarchive.
4. Select **Unarchive**.
5. In the **Unarchive workspace** window, select **Unarchive**.

You can also unarchive a workspace from inside it. Select **Workspaces > [workspace name]**, select **More**, then select **Unarchive**.

After you unarchive a workspace, it's active and editable again, its reports are unarchived, and **(Archived)** is removed from its name.

---

## How archiving a workspace affects billing

Archiving a workspace doesn't switch billing off. Expensify bills for report activity, not for having an active workspace. Archiving blocks most activity, but members can still export reports from an archived workspace, and an export counts as billable activity.

- **Pay-per-use subscription:** You're billed only for members who take billable activity that month. Activity from earlier in the month, before you archived the workspace, is still billed.
- **Collect plan (billed per unique member):** Members of an archived workspace aren't billed unless they take a report action on it, such as exporting a report.
- **Annual subscription:** The commitment continues through the end of the term, even if every workspace is archived. If you try to switch to pay-per-use before then, you'll see "You can’t downgrade during your annual subscription," with your subscription size and the date you can switch. To switch at the end of the term, disable auto-renew.

[Learn more about billing terms and definitions](/articles/new-expensify/billing-and-subscriptions/Learn-About-Billing-Terms-and-Definitions).

---

# FAQ

## Can I delete a workspace instead of archiving it?

No. Archiving replaces deleting a workspace in New Expensify. Your workspace data is kept so you can unarchive the workspace later.

## Can I archive a workspace on an annual subscription?

Yes, at any time. Your annual subscription continues through the end of the term.

## Does archiving a workspace stop my billing?

Not completely. Archiving blocks most activity, but exporting a report from an archived workspace is billable activity, and an annual subscription continues through the end of the term. See [How archiving a workspace affects billing](#how-archiving-a-workspace-affects-billing).

## What happens to my expenses after I archive a workspace?

They're kept and become read-only. You can find them on the **Spend** page, and you can move reports to an active workspace.

## Why can't I see an archived workspace?

Only billing owners, workspace admins, and auditors can access an archived workspace. If you have one of these roles, select **Workspace status** in the **Workspaces** tab and choose **Archived**.
