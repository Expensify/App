---
title: Connect HiBob to Expensify
description: Learn how to connect HiBob to your Expensify workspace to automatically sync employees and manage approvals.
keywords: [New Expensify, HiBob, Bob, HiBob integration, HR integration, employee sync, approval workflow, connect HiBob, HR tab, manual sync]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting HiBob via the HR tab using Merge Link, selecting companies to sync, configuring approval mode, viewing synced employees on the Members tab, and triggering manual re-syncs. Does not cover accounting integrations.
---

# Connect HiBob to Expensify

Expensify's HiBob integration automates employee management by syncing employee data and approval workflows from HiBob into your Expensify workspace.

Once connected, the integration can:

- **Create Expensify accounts** for active employees when they're hired in HiBob.
- **Update approval workflows** based on manager relationships in HiBob.
- **Remove employees** from the workspace when they are terminated in HiBob.
- **Auto-sync daily** to keep your workspace members in sync with HiBob.

---

## Who can connect HiBob to Expensify

To connect HiBob, you must be a **Workspace Admin** on a workspace with the Control plan in Expensify and:

- Be an admin in HiBob.
- Ensure every employee record in HiBob includes their work email address.
- Have **HR** integrations enabled on your workspace. Enable **HR** under **More features** in the **Integrate** section.

HiBob syncs all employees to **one** Expensify workspace. If your company uses multiple workspaces, choose which one to connect during setup.

---

## How to connect HiBob to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace you want to connect to HiBob.
3. In the left menu, select **HR**.
4. Next to **HiBob**, click **Connect**.
5. Authenticate with your HiBob admin credentials in the connection window that opens, and authorize Expensify to access your HiBob account.
6. When prompted, select the companies you want to sync into this workspace.
7. Wait for the initial sync to complete and for the sync results to appear.

<!-- SCREENSHOT:
Suggestion: The HR tab showing the HiBob card with the Connect button.
Location: How to connect HiBob to Expensify
Purpose: Helps admins locate the HiBob card on the HR tab.
-->

---

## What happens after you connect HiBob to Expensify

After the initial sync completes:

- A sync results panel displays employees added, removed, and skipped.
- If you leave the **HR** or **Members** tab before the sync finishes, the sync results are emailed to the workspace's technical contact instead of displaying in the app.
- The **Members** tab displays employees synced from HiBob.
- Active employees in HiBob are added to the Expensify workspace automatically.
- Employees receive a welcome email with instructions to finish setting up their Expensify account.
- Approval workflows can be managed using **Approval mode** and **Final approver** settings on the HiBob integration.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee and manager data is updated to match HiBob.
- Terminated employees in HiBob are removed from the workspace automatically.

A **Last synced** timestamp on the HiBob integration shows when the most recent sync ran.

---

## How to configure the approval mode for HiBob

After connecting HiBob, choose an approval mode that determines how expense reports are routed for approval:

- **Basic Approval** — All employees submit reports to a single final approver.
- **Manager Approval** — Reports first go to the employee's direct manager (synced from HiBob), then to a final approver.
- **Custom Approval** — Employees are synced from HiBob, but approval workflows are managed manually in Expensify.

To change the approval mode or final approver on your workspace:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to HiBob.
3. In the left menu, click **HR**.
4. Click **HiBob**.
5. Click **Approval mode** or **Final approver** to update the settings.
6. Click **Save**.

When **Manager Approval** is selected, approval workflows are automatically built from the manager relationships in HiBob. These approval workflows appear on the **Workflows** tab with a HiBob indicator. The **Approvals** toggle on the **Workflows** tab is locked on and cannot be turned off while HiBob is connected.

When **Custom Approval** is selected, the **Workflows** tab remains fully editable. Workspace members are synced from HiBob, but approval workflows are configured manually by a Workspace Admin.

To change approval settings, use the **HR** tab rather than the **Workflows** tab.

---

## How to manually refresh the HiBob sync

After connecting HiBob, a daily auto-sync runs to keep your workspace members up to date with HiBob. You can also refresh the sync manually.

To refresh the sync manually:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to HiBob.
3. In the left menu, click **HR**.
4. Click **HiBob**.
5. Select the three dots **(⋮)**, then click **Sync now**.
6. Wait for the sync to complete. The sync results will display a summary of any changes.

Manual syncs are limited to twice per day. After two manual syncs, a message confirms that the next sync will run the following day.

---

## How to disconnect HiBob from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to HiBob.
3. In the left menu, click **HR**.
4. Click **HiBob**.
5. Select the three dots **(⋮)**, then click **Disconnect**.
6. Confirm by clicking **Disconnect** again.

Disconnecting HiBob unlocks the **Approvals** toggle on the **Workflows** tab, allowing you to manage approval workflows manually again. Disconnecting HiBob also stops future employee syncs and automatic removals. Existing workspace members are not removed.

---

# FAQ

## Can I sync employees to different Expensify workspaces?

No. HiBob syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why were some employees skipped during sync?

Employees may be skipped if they do not have a work email address in HiBob, or if they are not active employees. The sync results panel will provide specific reasons for each skipped employee.

## Will my employees receive a notification when synced?

Yes. Each synced employee that is newly invited to a workspace receives a welcome email at their work email address with account setup instructions.

## Can I change the approval mode after connecting?

Yes. Go to the **HR** tab, click **HiBob**, and update the approval mode or final approver at any time.

## Why can't I sync HiBob again today?

Manual syncs are limited to twice per day. If you've already synced twice, the next sync runs automatically the following day.

## Why can't I turn off Approvals on the Workflows tab?

When HiBob is connected, the **Approvals** toggle is locked on because approval workflows are managed by the HiBob integration. To change approval settings, go to the **HR** tab. To unlock the toggle, disconnect HiBob.
