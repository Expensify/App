---
title: Connect BambooHR to Expensify
description: Learn how to connect BambooHR to your Expensify workspace, complete the initial setup, and automatically sync employees and approval workflows.
keywords: [New Expensify, BambooHR, BambooHR integration, connect BambooHR, HR integration, employee sync, approval workflow]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting BambooHR, completing the initial setup, configuring approval mode, and running the initial employee sync. Does not cover accounting integrations.
---

# Connect BambooHR to Expensify

Connect BambooHR to your Expensify workspace to automatically sync employees and approval workflows. After the initial setup, Expensify keeps your workspace up to date with daily employee syncs.

Once connected, the integration can:

- Add new employees to your Expensify workspace.
- Update approval workflows based on manager relationships in BambooHR.
- Remove terminated employees from the workspace.
- Automatically sync employee data every day.

---

## Who can connect BambooHR to Expensify

To connect BambooHR, you must:

- Be a Workspace Admin on a Control workspace in Expensify.
- Be an administrator in BambooHR.
- Ensure every employee in BambooHR has a work email address.
- Have **HR** enabled under **More features** in the workspace.

BambooHR syncs employees to one Expensify workspace. If your organization uses multiple workspaces, choose the workspace you want to sync before connecting BambooHR.

---

## How to connect BambooHR to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace you want to connect to BambooHR.
3. In the left menu, select **HR**.
4. Next to **BambooHR**, click **Connect**.
5. In the connection window that opens, sign in with your BambooHR administrator account and authorize Expensify to access your BambooHR account.
6. Wait for the initial connection to complete.
7. After the connection is established, BambooHR displays a green status indicator.
8. Click the green status indicator, then click **Complete setup**.
9. Choose which BambooHR data to sync with this workspace, then click **Save**.
10. Wait for the initial sync to complete.

> **Note:** During the initial sync, you'll see a **Your connection is syncing** message. The initial sync can take several minutes to complete, especially for larger BambooHR accounts, so keep the page open until the sync finishes.

---

## What happens after you connect BambooHR to Expensify

After the initial sync finishes:

- The BambooHR connection displays the **Last synced** timestamp.
- Active employees in BambooHR are added to the workspace.
- Employees who don't already have an Expensify account receive an email invitation to finish setting up their account.
- The **Members** tab displays synced employees.
- You can configure the workspace's **Approval mode** and **Final approver** from the **HR** page.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee information and manager relationships are updated to match BambooHR.
- Terminated employees in BambooHR are removed from the workspace automatically.
  
---

## How to configure the approval mode for BambooHR

After the initial sync, choose how expense reports are routed for approval.

- **Basic Approval** — All employees submit reports to a single final approver.
- **Manager Approval** — Employees submit reports to their direct manager from BambooHR before the final approver.
- **Custom Approval** — Employees are synced from BambooHR, but approval workflows are managed manually in Expensify.

Changes to **Approval mode** and **Final approver** are made from the **HR** page.

---

## What happens to approval workflows after connecting BambooHR

When **Basic approval** or **Manager approval** is selected:

- The **Approvals** setting under **Workflows** is locked on.
- The page displays **Configure via BambooHR**.
- Approval workflows must be managed from the BambooHR connection settings instead of the **Workflows** page.

When **Custom approval** is selected:

- Approval workflows remain editable in **Workflows**.
- You can manage approval routing manually in Expensify.
  
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

Manual syncs are limited to two per day. If you've reached the limit, you'll see **You've reached your sync limit for the day**.

---

## How to disconnect BambooHR from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to BambooHR.
3. In the left menu, click **HR**.
4. Click **BambooHR**.
5. Select the three dots **(⋮)**, then click **Disconnect**.
6. Confirm by clicking **Disconnect** again.

Disconnecting BambooHR stops future employee syncs and unlocks the **Approvals** setting so approval workflows can be managed in Expensify again. Existing workspace members remain in the workspace.

---

# FAQ

## Can I sync employees to different Expensify workspaces?

No. BambooHR syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why were some employees skipped during sync?

Employees may be skipped if they do not have a work email address in BambooHR, or if they are not active employees. The sync results panel will provide specific reasons for each skipped employee.

## Will my employees receive a notification when synced?

Yes. Each synced employee that is newly invited to a workspace receives a welcome email at their work email address with account setup instructions.

## Why is BambooHR connected but my employees haven't synced?

Connecting BambooHR authorizes the integration. To start importing employees, click the green status indicator, select **Complete setup**, choose the data to sync, and click **Save**.

## Why can't I sync BambooHR again today?

Manual syncs are limited to two per day. If you've already synced twice, the next sync runs automatically the following day.
