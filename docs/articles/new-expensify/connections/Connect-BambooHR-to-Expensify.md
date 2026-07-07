---
title: Connect BambooHR to Expensify
description: Learn how to connect BambooHR to your Expensify workspace to automatically sync employees and manage approvals.
keywords: [New Expensify, BambooHR, Bamboo, BambooHR integration, HR integration, employee sync, approval workflow, connect BambooHR, HR tab, manual sync]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting BambooHR via the HR tab using Merge Link, selecting companies to sync, configuring approval mode, viewing synced employees on the Members tab, and triggering manual re-syncs. Does not cover accounting integrations.
---

# Connect BambooHR to Expensify

Expensify's BambooHR integration automates employee management by syncing employee data and approval workflows from BambooHR into your Expensify workspace.

Once connected, the integration can:

- **Create Expensify accounts** for active employees when they're hired in BambooHR.
- **Update approval workflows** based on manager relationships in BambooHR.
- **Remove employees** from the workspace when they are terminated in BambooHR.
- **Auto-sync daily** to keep your workspace members in sync with BambooHR.

---

## Who can connect BambooHR to Expensify

To connect BambooHR, you must be a **Workspace Admin** on a workspace with the Control plan in Expensify and:

- Be an admin in BambooHR.
- Ensure every employee record in BambooHR includes their work email address.
- Have **HR** integrations enabled on your workspace. Enable **HR** under **More features** in the **Integrate** section.

BambooHR syncs all employees to **one** Expensify workspace. If your company uses multiple workspaces, choose which one to connect during setup.

---

## How to connect BambooHR to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace you want to connect to BambooHR.
3. In the left menu, select **HR**.
4. Next to **BambooHR**, click **Connect**.
5. Authenticate with your BambooHR admin credentials in the connection window that opens, and authorize Expensify to access your BambooHR account.
6. When prompted, select the companies you want to sync into this workspace.
7. Wait for the initial sync to complete and for the sync results to appear.

<!-- SCREENSHOT:
Suggestion: The HR tab showing the BambooHR card with the Connect button.
Location: How to connect BambooHR to Expensify
Purpose: Helps admins locate the BambooHR card on the HR tab.
-->

---

## What happens after you connect BambooHR to Expensify

After the initial sync completes:

- A sync results panel displays employees added, removed, and skipped.
- If you leave the **HR** or **Members** tab before the sync finishes, the sync results are emailed to the workspace's technical contact instead of displaying in the app.
- The **Members** tab displays employees synced from BambooHR.
- Active employees in BambooHR are added to the Expensify workspace automatically.
- Employees receive a welcome email with instructions to finish setting up their Expensify account.
- Approval workflows can be managed using **Approval mode** and **Final approver** settings on the BambooHR integration.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee and manager data is updated to match BambooHR.
- Terminated employees in BambooHR are removed from the workspace automatically.

A **Last synced** timestamp on the BambooHR integration shows when the most recent sync ran.

---

## How to configure the approval mode for BambooHR

After connecting BambooHR, choose an approval mode that determines how expense reports are routed for approval:

- **Basic Approval** — All employees submit reports to a single final approver.
- **Manager Approval** — Reports first go to the employee's direct manager (synced from BambooHR), then to a final approver.
- **Custom Approval** — Employees are synced from BambooHR, but approval workflows are managed manually in Expensify.

To change the approval mode or final approver on your workspace:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to BambooHR.
3. In the left menu, click **HR**.
4. Click **BambooHR**.
5. Click **Approval mode** or **Final approver** to update the settings.
6. Click **Save**.

When **Manager Approval** is selected, approval workflows are automatically built from the manager relationships in BambooHR. These approval workflows appear on the **Workflows** tab with a BambooHR indicator. The **Approvals** toggle on the **Workflows** tab is locked on and cannot be turned off while BambooHR is connected.

When **Custom Approval** is selected, the **Workflows** tab remains fully editable. Workspace members are synced from BambooHR, but approval workflows are configured manually by a Workspace Admin.

To change approval settings, use the **HR** tab rather than the **Workflows** tab.

---

## How to manually refresh the BambooHR sync

After connecting BambooHR, a daily auto-sync runs to keep your workspace members up to date with BambooHR. You can also refresh the sync manually.

To refresh the sync manually:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to BambooHR.
3. In the left menu, click **HR**.
4. Click **BambooHR**.
5. Select the three dots **(⋮)**, then click **Sync now**.
6. Wait for the sync to complete. The sync results will display a summary of any changes.

Manual syncs are limited to twice per day. After two manual syncs, a message confirms that the next sync will run the following day.

---

## How to disconnect BambooHR from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to BambooHR.
3. In the left menu, click **HR**.
4. Click **BambooHR**.
5. Select the three dots **(⋮)**, then click **Disconnect**.
6. Confirm by clicking **Disconnect** again.

Disconnecting BambooHR unlocks the **Approvals** toggle on the **Workflows** tab, allowing you to manage approval workflows manually again. Disconnecting BambooHR also stops future employee syncs and automatic removals. Existing workspace members are not removed.

---

# FAQ

## Can I sync employees to different Expensify workspaces?

No. BambooHR syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why were some employees skipped during sync?

Employees may be skipped if they do not have a work email address in BambooHR, or if they are not active employees. The sync results panel will provide specific reasons for each skipped employee.

## Will my employees receive a notification when synced?

Yes. Each synced employee that is newly invited to a workspace receives a welcome email at their work email address with account setup instructions.

## Can I change the approval mode after connecting?

Yes. Go to the **HR** tab, click **BambooHR**, and update the approval mode or final approver at any time.

## Why can't I sync BambooHR again today?

Manual syncs are limited to twice per day. If you've already synced twice, the next sync runs automatically the following day.

## Why can't I turn off Approvals on the Workflows tab?

When BambooHR is connected, the **Approvals** toggle is locked on because approval workflows are managed by the BambooHR integration. To change approval settings, go to the **HR** tab. To unlock the toggle, disconnect BambooHR.
