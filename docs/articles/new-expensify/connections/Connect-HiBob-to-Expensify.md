---
title: Connect HiBob to Expensify
description: Learn how to connect HiBob to your Expensify workspace, complete the initial setup, and automatically sync employees and approval workflows.
keywords: [New Expensify, HiBob, HiBob integration, connect HiBob, HR integration, employee sync, approval workflow]
internalScope: Audience is Workspace Admins on Control plans. Covers connecting HiBob, completing the initial setup, configuring approval mode, and running the initial employee sync. Does not cover accounting integrations.
---

# Connect HiBob to Expensify

Connect HiBob to your Expensify workspace to automatically sync employees and approval workflows. After the initial setup, Expensify keeps your workspace up to date with daily employee syncs.

Once connected, the integration can:

- Add new employees to your Expensify workspace.
- Update approval workflows based on manager relationships in HiBob.
- Remove terminated employees from the workspace.
- Automatically sync employee data every day.

---

## Who can connect HiBob to Expensify

To connect HiBob, you must:

- Be a Workspace Admin on a Control workspace in Expensify.
- Be an administrator in HiBob.
- Ensure every employee in HiBob has a work email address.
- Have **HR** enabled under **More features** in the workspace.

HiBob syncs employees to one Expensify workspace. If your organization uses multiple workspaces, choose the workspace you want to sync before connecting HiBob.

---

## How to connect HiBob to Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the workspace you want to connect to HiBob.
3. In the left menu, select **HR**.
4. Next to **HiBob**, click **Connect**.
5. In the connection window that opens, sign in with your HiBob administrator account and authorize Expensify to access your HiBob account.
6. Wait for the initial connection to complete.
7. After the connection is established, HiBob displays a green status indicator.
8. Click the green status indicator, then click **Complete setup**.
9. Choose which HiBob data to sync with this workspace, then click **Save**.
10. Wait for the initial sync to complete.

> **Note:** During the initial sync, you'll see a **Your connection is syncing** message. The initial sync can take several minutes to complete, especially for larger HiBob accounts, so keep the page open until the sync finishes.

---

## What happens after you connect HiBob to Expensify

After the initial sync finishes:

- The HiBob connection displays the **Last synced** timestamp.
- Active employees in HiBob are added to the workspace.
- Employees who don't already have an Expensify account receive an email invitation to finish setting up their account.
- The **Members** tab displays synced employees.
- You can configure the workspace's **Approval mode** and **Final approver** from the **HR** page.

Expensify also runs a daily auto-sync to keep employee data up to date:

- Employee information and manager relationships are updated to match HiBob.
- Terminated employees in HiBob are removed from the workspace automatically.
  
---

## How to configure the approval mode for HiBob

After the initial sync, choose how expense reports are routed for approval.

- **Basic Approval** — All employees submit reports to a single final approver.
- **Manager Approval** — Employees submit reports to their direct manager from HiBob before the final approver.
- **Custom Approval** — Employees are synced from HiBob, but approval workflows are managed manually in Expensify.

Changes to **Approval mode** and **Final approver** are made from the **HR** page.

---

## What happens to approval workflows after connecting HiBob

When **Basic approval** or **Manager approval** is selected:

- The **Approvals** setting under **Workflows** is locked on.
- The page displays **Configure via HiBob**.
- Approval workflows must be managed from the HiBob connection settings instead of the **Workflows** page.

When **Custom approval** is selected:

- Approval workflows remain editable in **Workflows**.
- You can manage approval routing manually in Expensify.
  
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

Manual syncs are limited to two per day. If you've reached the limit, you'll see **You've reached your sync limit for the day**.

---

## How to disconnect HiBob from Expensify

1. In the navigation tabs (on the left on web, on the bottom on mobile), select **Workspaces**.
2. Click the name of the workspace connected to HiBob.
3. In the left menu, click **HR**.
4. Click **HiBob**.
5. Select the three dots **(⋮)**, then click **Disconnect**.
6. Confirm by clicking **Disconnect** again.

Disconnecting HiBob stops future employee syncs and unlocks the **Approvals** setting so approval workflows can be managed in Expensify again. Existing workspace members remain in the workspace.

---

# FAQ

## Can I sync employees to different Expensify workspaces?

No. HiBob syncs all employees to a single Expensify workspace. You must choose one workspace when connecting.

## Why were some employees skipped during sync?

Employees may be skipped if they do not have a work email address in HiBob, or if they are not active employees. The sync results panel will provide specific reasons for each skipped employee.

## Will my employees receive a notification when synced?

Yes. Each synced employee that is newly invited to a workspace receives a welcome email at their work email address with account setup instructions.

## Why is HiBob connected but my employees haven't synced?

Connecting HiBob authorizes the integration. To start importing employees, click the green status indicator, select **Complete setup**, choose the data to sync, and click **Save**.

## Why can't I sync HiBob again today?

Manual syncs are limited to two per day. If you've already synced twice, the next sync runs automatically the following day.
