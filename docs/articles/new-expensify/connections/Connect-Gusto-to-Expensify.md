---
title: Connect Gusto to Expensify
description: Learn how to connect Gusto to your Expensify workspace to automatically sync employees and manage approvals.
keywords: [New Expensify, Gusto, Gusto integration, HR integration, employee sync, approval workflow, connect Gusto, HR tab, manual sync]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting Gusto via the HR tab, configuring approval mode, viewing synced employees on the Members tab, and triggering manual re-syncs. Does not cover Expensify Classic Gusto integration or accounting integrations.
---

# Connect Gusto to Expensify

Expensify's Gusto integration automates employee management by syncing employee data and approval workflows from Gusto into your Expensify workspace.

Once connected, the integration can:

- **Create Expensify accounts** for full-time, active employees when they're hired in Gusto.
- **Update approval workflows** based on manager relationships in Gusto.
- **Remove employees** from the workspace when they are terminated in Gusto.
- **Auto-sync daily** to keep your workspace members in sync with Gusto.

---

## Who can connect Gusto to Expensify

To connect Gusto, you must be a **Workspace Admin** on a Control Workspace in Expensify and: 

- Be an admin in Gusto. 
- Ensure every employee record in Gusto includes their work email address.
- Have **HR** integrations enabled on your workspace. Enable **HR** under **More features** in the **Integrate** section.

Gusto syncs all employees to **one** Expensify workspace. If your company uses multiple workspaces, choose which one to connect during setup.

---

## How to connect Gusto to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace you want to connect to Gusto.
3. In the left menu, select **HR**.
4. Next to **Gusto**, click **Connect**.
5. When prompted, enter your Gusto admin credentials and authorize Expensify to access your Gusto account.
6. Wait for the sync to complete and for the message **Successfully synced your Gusto connection** to appear.

---

## What happens after you connect Gusto to Expensify

After the initial sync completes:

- A sync results panel displays employees added, removed, and skipped.
- If you leave the **HR** or **Members** tab before the sync finishes, the sync results are emailed to the workspace's technical contact instead of displaying in the app.
- The **Members** tab displays employees synced from Gusto.
- Full-time active employees in Gusto are added to the Expensify workspace automatically.
- Employees receive a welcome email with instructions to finish setting up their Expensify account.
- Approval workflows can be managed using **Approval mode** and **Final approver** settings on the Gusto integration.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee and manager data is updated to match Gusto.
- Terminated employees in Gusto are removed from the workspace automatically.

## How to configure the approval mode for Gusto

After connecting Gusto, choose an approval mode that determines how expense reports are routed for approval:

- **Basic Approval** — All employees submit reports to a single final approver.
- **Manager Approval** — Reports first go to the employee's direct manager (synced from Gusto), then to a final approver.
- **Custom Approval** — Employees are synced from Gusto, but approval workflows are managed manually in Expensify.

To change the approval mode or final approver on your workspace:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to Gusto.
3. In the left menu, click **HR**.
4. Click **Gusto**.
5. Click **Approval mode** or **Final approver** to update the settings.
6. Click **Save**.

When **Manager Approval** is selected, approval workflows are automatically built from the manager relationships in Gusto. These approval workflows appear on the **Workflows** tab with a Gusto indicator. The **Approvals** toggle on the **Workflows** tab is locked on and cannot be turned off while Gusto is connected.

When **Custom Approval** is selected, the **Workflows** tab remains fully editable. Workspace members are synced from Gusto, but approval workflows are configured manually by a Workspace Admin.

To change approval settings, use the **HR** tab rather than the **Workflows** tab.

---

## How to manually refresh the Gusto sync

After connecting Gusto, a daily auto-sync runs to keep your workspace members up to date with Gusto. You can also refresh the sync manually at any time.

To refresh the sync manually: 

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to Gusto.
3. In the left menu, click **HR**.
4. In the left menu, click **Members**.
5. Click the **Re-sync** button in the Gusto section.
6. Wait for the sync to complete. The sync results will display a summary of any changes.

---

## How to disconnect Gusto from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to Gusto.
3. In the left menu, click **HR**.
4. Click **Gusto**.
5. Click **Disconnect**.
6. Confirm by clicking **Disconnect** again.

Disconnecting Gusto unlocks the **Approvals** toggle on the **Workflows** tab, allowing you to manage approval workflows manually again. Disconnecting Gusto also stops future employee syncs and automatic removals. Existing workspace members are not removed.

---

# FAQ

## Can I sync employees to different Expensify workspaces?

No. Gusto syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why were some employees skipped during sync?

Employees may be skipped if they do not have a work email address in Gusto, or if they are not classified as full-time active employees. The sync results panel will provide specific reasons for each skipped employee.

## Will my employees receive a notification when synced?

Yes. Each synced employee that is newly invited to a workspace receives a welcome email at their work email address with account setup instructions.

## Can I change the approval mode after connecting?

Yes. Go to the **HR** tab, click **Gusto**, and update the approval mode or final approver at any time.

## Why can't I turn off Approvals on the Workflows tab?

When Gusto is connected, the **Approvals** toggle is locked on because approval workflows are managed by the Gusto integration. To change approval settings, go to the **HR** tab. To unlock the toggle, disconnect Gusto.
