---
title: DESK09 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK09 export error in QuickBooks Desktop when a selected location is missing or inactive.
keywords: DESK09, QuickBooks Desktop location not found, location inactive QuickBooks Desktop, export error location missing, QuickBooks Desktop class location error, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK09 export error caused by missing or inactive locations. Does not cover QuickBooks Online errors.
---

# DESK09 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK09: Locations not found. The location selected may be deleted or inactive in QuickBooks Desktop.

This means the location selected on the report does not exist or is inactive in QuickBooks Desktop.

---

## Why the DESK09 Export Error Happens in QuickBooks Desktop

The DESK09 error occurs when:

- The location selected on the report was deleted in QuickBooks Desktop.
- The location was made inactive.
- The Expensify connection has not been synced after location changes.

If QuickBooks Desktop cannot find the selected location, the export will fail.

---

## How to Fix the DESK09 Export Error

### Step One: Confirm the Location in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Navigate to your **Location** list (if using location tracking).
3. Confirm the location selected on the report:
   - Exists.
   - Is active.

If the location does not exist, create it.

If the location is inactive, reactivate it.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

This refreshes the connection and imports updated locations.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct location is selected.
3. Retry exporting the report.

Once the location exists and is active in QuickBooks Desktop, the export should complete successfully.

---

# FAQ

## Does DESK09 Mean My QuickBooks Desktop Connection Is Broken?

No. This error usually indicates that the selected location is missing or inactive.

## Do I Need to Reconnect QuickBooks Desktop?

No. Running **Sync now** after creating or reactivating the location should resolve the issue.
