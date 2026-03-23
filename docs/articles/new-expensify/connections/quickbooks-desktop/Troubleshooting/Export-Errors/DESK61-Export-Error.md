---
title: DESK61 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK61 export error means and how to restore or activate missing classes in QuickBooks Desktop before exporting.
keywords: DESK61, QuickBooks Desktop classes not found, class inactive QuickBooks, class deleted QuickBooks Desktop, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK61 export error related to missing or inactive classes in QuickBooks Desktop. Does not cover connection or account configuration errors.
---

# DESK61 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK61 Export Error: Classes not found. The class selected may be deleted or inactive in QuickBooks Desktop.

This means the class selected on the report does not exist or is inactive in QuickBooks Desktop.

QuickBooks must have the selected class available and active in order to complete the export.

---

## Why the DESK61 Export Error Happens in QuickBooks Desktop

The DESK61 error typically occurs when:

- The selected class was deleted in QuickBooks Desktop.
- The class was made inactive.
- The class was renamed after the last sync.
- The Workspace has not synced after changes were made in QuickBooks.

If QuickBooks cannot find the selected class, the export will fail.

This is a class list mismatch issue, not a connection issue.

---

# How to Fix the DESK61 Export Error

Follow the steps below to restore the class and retry the export.

---

## Confirm the Class in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Go to the **Class List**.
3. Locate the class referenced in the report.
4. Confirm the class:
   - Exists.
   - Is active.
5. If the class is inactive, make it active.
6. If the class does not exist, create it.
7. Save any changes.

---

## Run Sync in the Workspace

After confirming or creating the class:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

This refreshes the class list from QuickBooks Desktop.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If the class exists and is active, the export should complete successfully.

---

# FAQ

## Does the DESK61 Error Mean the Integration Is Disconnected?

No. It means QuickBooks Desktop cannot find the referenced class.

## Should I Create a New Class or Reactivate the Old One?

If possible, reactivate the original class to avoid reporting inconsistencies. Create a new class only if the original was permanently removed.

## Will Running Sync Automatically Fix It?

Running **Sync now** will refresh the class list, but the class must first exist and be active in QuickBooks Desktop.
