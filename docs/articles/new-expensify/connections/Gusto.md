---
title: Connect Gusto to Expensify
description: Learn how to connect Gusto to your Expensify workspace to automatically sync employees, manage approvals, and trigger manual re-syncs.
keywords: [New Expensify, Gusto, HR integration, employee sync, approval workflow, connect Gusto, HR page, manual sync]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting Gusto via the HR page, configuring approval mode, viewing synced employees on the Members page, and triggering manual re-syncs. Does not cover Expensify Classic Gusto integration or accounting integrations.
---

Expensify's integration with Gusto automates employee management by syncing employee data and approval workflows from Gusto into your Expensify workspace. Once connected, the integration will:

- **Create Expensify accounts** for full-time, active employees when they're hired in Gusto.
- **Update approval workflows** based on manager relationships in Gusto.
- **Remove employees** from the workspace when they are terminated in Gusto.
- **Auto-sync daily** to keep your workspace members in sync with Gusto.

---

## Who can connect Gusto to Expensify

To connect Gusto, you must:

- Be an **admin** in both Gusto and Expensify.
- Have a **Control** workspace in Expensify. If you have a Collect workspace, you will be prompted to upgrade when enabling the HR feature.
- Ensure every employee in Gusto has a **work email address**, as this is used as the unique identifier in Expensify.

Gusto syncs all employees to **one** Expensify workspace. If your company uses multiple workspaces, choose which one to connect during setup.

---

## How to enable the HR feature and connect Gusto

1. In the **navigation tabs** (on the left on web, and at the bottom on mobile), click **Workspaces**.
2. Click your workspace name to access the settings for that workspace.
3. In the left menu, click **More Features**.
4. Under the **Integrate** section, toggle on **HR**.
5. In the left menu, click **HR**.
6. Select **Gusto**.
7. Log in to Gusto with your admin credentials and authorize Expensify to access your account.
8. Wait for the sync to complete. A sync results panel will display a summary of employees added, removed, and skipped.

**Note:** If you are on a Collect workspace, toggling on **HR** will prompt you to upgrade to a Control workspace first. After upgrading, the feature enables automatically.

**Note:** If you navigate away from the HR or Members page before the sync finishes, the sync results will be emailed to the workspace's technical contact instead of displaying in the app.

<!-- SCREENSHOT:
Suggestion: The HR page showing Gusto as an available integration with the Connect button
Location: After step 6
Purpose: Helps admins identify where to find the Gusto connection option
-->

<!-- SCREENSHOT:
Suggestion: The sync results panel showing employees added, removed, and skipped
Location: After step 8
Purpose: Shows admins what to expect after a successful sync
-->

---

## How to configure the approval mode for Gusto

After connecting Gusto, choose an approval mode that determines how expense reports are routed for approval:

- **Basic Approval** — All employees submit reports to a single final approver (default: Workspace Billing Owner).
- **Manager Approval** — Reports first go to the employee's direct manager (synced from Gusto), then to a final approver (default: Workspace Billing Owner).

To change the approval mode or final approver:

1. In the left menu, click **HR**.
2. Click **Gusto**.
3. Update the **Approval mode** or **Final approver** settings.
4. Click **Save**.

When **Manager Approval** is selected, approval chains are automatically built from the manager relationships in Gusto. These approval chains are visible on the **Workflows** page with a Gusto attribution indicator. The **Approvals** toggle on the Workflows page is locked on and cannot be turned off while Gusto is connected.

To change approval settings, use the HR page rather than the Workflows page.

<!-- SCREENSHOT:
Suggestion: The approval mode configuration options on the HR page (Basic Approval and Manager Approval)
Location: After the approval mode bullet list
Purpose: Shows admins the available approval mode options
-->

---

## How to view synced employees and trigger a manual re-sync

After connecting Gusto, the **Members** page displays how many employees are synced from Gusto.

To trigger a manual re-sync:

1. In the left menu, click **Members**.
2. Click the **Re-sync** button in the Gusto section.
3. Wait for the sync to complete. The sync results will display a summary of any changes.

A daily auto-sync also runs automatically to keep your workspace members up to date with Gusto.

---

## How to disconnect Gusto from Expensify

1. In the left menu, click **HR**.
2. Click **Gusto**.
3. Click **Disconnect**.
4. Confirm by clicking **Disconnect** again.

Disconnecting Gusto will unlock the **Approvals** toggle on the Workflows page, allowing you to manage approval workflows manually again. Existing workspace members will not be removed.

---

# FAQ

## Can I sync employees to different Expensify workspaces?

No. Gusto syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why were some employees skipped during sync?

Employees may be skipped if they do not have a work email address in Gusto, or if they are not classified as full-time active employees. The sync results panel will provide specific reasons for each skipped employee.

## Will my employees receive a notification when synced?

Yes. Each synced employee will receive a welcome email at their work email address with account setup instructions.

## Can I change the approval mode after connecting?

Yes. Go to the HR page, click **Gusto**, and update the approval mode or final approver at any time.

## Why can't I turn off Approvals on the Workflows page?

When Gusto is connected, the **Approvals** toggle is locked on because approval workflows are managed by the Gusto integration. To change approval settings, go to the HR page. To unlock the toggle, disconnect Gusto.
