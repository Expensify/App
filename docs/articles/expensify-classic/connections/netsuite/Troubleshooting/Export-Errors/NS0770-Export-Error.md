---
title: NS0770 Export Error in NetSuite Integration
description: Learn how to fix the NS0770 export error in NetSuite when a selected project is inactive and cannot accept expenses.
keywords: NS0770, NetSuite project not active, project cannot accept expenses NetSuite, inactive project export error, update project tag Expensify, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0770 export error caused by inactive projects. Does not cover other NetSuite error codes.
---

# NS0770 Export Error in NetSuite Integration

If you see the error:

NS0770: Project [X] is not active and can’t accept expenses. Please update the project tag.

This means the project selected on the report is inactive in NetSuite.

---

## Why the NS0770 Export Error Happens in NetSuite

The NS0770 error occurs when:

- The project selected in Expensify has been made inactive in NetSuite.
- The project was closed and can no longer accept expenses.
- The Workspace has not been synced after project updates.
- A manually created tag in Expensify does not match an active project in NetSuite.

NetSuite does not allow expenses to be posted to inactive projects.

---

## How to Fix the NS0770 Export Error

### Step One: Confirm the Project Status in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists**.
3. Select **Relationships**.
4. Click **Projects**.
5. Locate the project selected in Expensify.
6. Confirm the project:
   - Exists.
   - Is marked as **Active**.

If the project is inactive, either:

- Reactivate the project in NetSuite, or  
- Select a different active project in Expensify.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct, active project is selected.
3. Retry exporting to NetSuite.

Once the project is active and synced, the export should complete successfully.

---

# FAQ

## Does NS0770 Mean the Project Was Deleted?

Not necessarily. The project may still exist but is marked as inactive.

## Do I Need to Reconnect NetSuite?

No. Reactivating the project and running **Sync** is typically sufficient.
