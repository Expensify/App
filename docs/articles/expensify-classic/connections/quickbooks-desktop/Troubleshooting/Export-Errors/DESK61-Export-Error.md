---
title: DESK61 Export Error in QuickBooks Desktop Web Connector
description: Learn how to fix the DESK61 export error in QuickBooks Desktop when a selected class is missing or inactive.
keywords: DESK61, QuickBooks Desktop class not found, class inactive QuickBooks Desktop, export error class missing, QuickBooks Desktop class error, Sync now, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using QuickBooks Desktop integration with Web Connector. Covers resolving the DESK61 export error caused by missing or inactive classes. Does not cover QuickBooks Online errors.
---

# DESK61 Export Error in QuickBooks Desktop Web Connector

If you see the error:

DESK61: Classes not found. The class selected may be deleted or inactive in QuickBooks Desktop.

This means the class selected on the report does not exist or is inactive in QuickBooks Desktop.

---

## Why the DESK61 Export Error Happens in QuickBooks Desktop

The DESK61 error occurs when:

- The class selected on the report was deleted in QuickBooks Desktop.
- The class was made inactive.
- The Expensify connection has not been synced after class changes in QuickBooks Desktop.

If QuickBooks Desktop cannot find the selected class, the export will fail.

---

## How to Fix the DESK61 Export Error

### Step One: Confirm the Class in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to **Lists** > **Class List**.
3. Confirm the class selected on the report:
   - Exists.
   - Is active.

If the class does not exist, create it.

If the class is inactive, reactivate it.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync now**.

This refreshes the class list from QuickBooks Desktop.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Confirm the correct class is selected.
3. Retry exporting the report.

Once the class exists and is active in QuickBooks Desktop, the export should complete successfully.

---

# FAQ

## Does DESK61 Mean My QuickBooks Desktop Connection Is Broken?

No. This error usually indicates that the selected class is missing or inactive.

## Do I Need to Reconnect QuickBooks Desktop?

No. Running **Sync now** after creating or reactivating the class typically resolves the issue.
