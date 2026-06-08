---
title: Connect TriNet to Expensify
description: Learn how to connect TriNet to your Expensify workspace to automatically sync employees and manage approvals.
keywords: [New Expensify, TriNet, Zenefits, TriNet integration, HR integration, employee sync, approval workflow, connect TriNet, HR tab, manual sync]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting TriNet via the HR tab, configuring approval mode, viewing synced employees on the Members tab, and triggering manual re-syncs. Does not cover Expensify Classic TriNet integration or accounting integrations.
---

# Connect TriNet to Expensify

Expensify's TriNet integration automates employee management by syncing employee data and approval workflows from TriNet into your Expensify workspace.

Once connected, the integration can:

- **Create Expensify accounts** for full-time, active employees when they're hired in TriNet.
- **Update approval workflows** based on manager relationships in TriNet.
- **Remove employees** from the workspace when they are terminated in TriNet.
- **Auto-sync daily** to keep your workspace members in sync with TriNet.

---

## Who can connect TriNet to Expensify

To connect TriNet, you must be a **Workspace Admin** on a Control Workspace in Expensify and: 

- Be an admin in TriNet.
- Ensure every employee record in TriNet includes their work email address.
- Have **HR** integrations enabled on your workspace. Enable **HR** under **More features** in the **Integrate** section.

TriNet syncs all employees to **one** Expensify workspace. If your company uses multiple workspaces, choose which one to connect during setup.

---

## How to connect TriNet to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace you want to connect to TriNet.
3. In the left menu, select **HR**.
4. Next to **TriNet**, click **Connect**.
5. When prompted, enter your TriNet admin credentials and authorize Expensify to access your TriNet account.
6. Wait for the sync to complete and for the message **Successfully synced your TriNet connection** to appear.

---

## What happens after you connect TriNet to Expensify

After the initial sync completes:

- A sync results panel displays employees added, removed, and skipped.
- If you leave the **HR** or **Members** tab before the sync finishes, the sync results are emailed to the workspace's technical contact instead of displaying in the app.
- The **Members** tab displays employees synced from TriNet.
- Full-time active employees in TriNet are added to the Expensify workspace automatically.
- Employees receive a welcome email with instructions to finish setting up their Expensify account.
- Approval workflows can be managed using **Approval mode** and **Final approver** settings on the TriNet integration.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee and manager data is updated to match TriNet.
- Terminated employees in TriNet are removed from the workspace automatically.

## How to configure the approval mode for TriNet

After connecting TriNet, choose an approval mode that determines how expense reports are routed for approval:

- **Basic Approval** — All employees submit reports to a single final approver.
- **Manager Approval** — Reports first go to the employee's direct manager (synced from TriNet), then to a final approver.
- **Custom Approval** — Employees are synced from TriNet, but approval workflows are managed manually in Expensify.

To change the approval mode or final approver on your workspace:

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to TriNet.
3. In the left menu, click **HR**.
4. Click **TriNet**.
5. Click **Approval mode** or **Final approver** to update the settings.
6. Click **Save**.

When **Manager Approval** is selected, approval workflows are automatically built from the manager relationships in TriNet. These approval workflows appear on the **Workflows** tab with a TriNet indicator. The **Approvals** toggle on the **Workflows** tab is locked on and cannot be turned off while TriNet is connected.

When **Custom Approval** is selected, the **Workflows** tab remains fully editable. Workspace members are synced from TriNet, but approval workflows are configured manually by a Workspace Admin.

To change approval settings, use the **HR** tab rather than the **Workflows** tab.

---

## How to manually refresh the TriNet sync

After connecting TriNet, a daily auto-sync runs to keep your workspace members up to date with TriNet. You can also refresh the sync manually at any time.

To refresh the sync manually: 

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to TriNet.
3. In the left menu, click **Members**.
4. Click the **Re-sync** button in the TriNet section.
5. Wait for the sync to complete. The sync results will display a summary of any changes.

---

## How to disconnect TriNet from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to TriNet.
3. In the left menu, click **HR**.
4. Click **TriNet**.
5. Click **Disconnect**.
6. Confirm by clicking **Disconnect** again.

Disconnecting TriNet unlocks the **Approvals** toggle on the **Workflows** tab, allowing you to manage approval workflows manually again. Disconnecting TriNet also stops future employee syncs and automatic removals. Existing workspace members are not removed.

---

# FAQ

## Can I sync employees to different Expensify workspaces?

No. TriNet syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why were some employees skipped during sync?

Employees may be skipped if they do not have a work email address in TriNet, or if they are not classified as full-time active employees. The sync results panel will provide specific reasons for each skipped employee.

## Will my employees receive a notification when synced?

Yes. Each synced employee that is newly invited to a workspace receives a welcome email at their work email address with account setup instructions.

## Can I connect multiple HR platforms at the same time?

No. Expensify supports one HR platform connection per workspace at a time. If you already have an HR platform connected (for example, Gusto) and try to connect TriNet, you will be prompted to disconnect the existing platform first.

## Can I change the approval mode after connecting?

Yes. Go to the **HR** tab, click **TriNet**, and update the approval mode or final approver at any time.

## Why can't I turn off Approvals on the Workflows tab?

When TriNet is connected, the **Approvals** toggle is locked on because approval workflows are managed by the TriNet integration. To change approval settings, go to the **HR** tab. To unlock the toggle, disconnect TriNet.
