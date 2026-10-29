---
title: DESK09 Export Error in QuickBooks Desktop Integration
description: Learn what the DESK09 export error means and how to restore or activate locations in QuickBooks Desktop before exporting.
keywords: DESK09, QuickBooks Desktop locations not found, location inactive QuickBooks, class location missing QuickBooks, Expensify QuickBooks Desktop export error, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Desktop integration. Covers resolving the DESK09 export error related to missing or inactive locations in QuickBooks Desktop. Does not cover mapping or connection configuration errors.
---

# DESK09 Export Error in QuickBooks Desktop Integration

If you see the error:

DESK09 Export Error: Locations not found. The location selected may be deleted or inactive in QuickBooks Desktop.

This means the location selected on the report does not exist or is inactive in QuickBooks Desktop.

QuickBooks must have the selected location available and active in order to complete the export.

---

## Why the DESK09 Export Error Happens in QuickBooks Desktop

The DESK09 error typically occurs when:

- The selected location was deleted in QuickBooks Desktop.
- The location was made inactive.
- The location was renamed after the last sync.
- The Workspace has not synced after changes were made in QuickBooks.

If QuickBooks cannot find the selected location, the export will fail.

This is a location list mismatch issue, not a connection issue.

---

# How to Fix the DESK09 Export Error

Follow the steps below to restore the location and retry the export.

---

## Confirm the Location in QuickBooks Desktop

1. Open **QuickBooks Desktop**.
2. Navigate to your **Locations** list.
3. Confirm the location referenced in the report:
   - Exists.
   - Is active.
4. If the location is inactive, make it active.
5. If the location does not exist, create it.

Save any changes.

---

## Run Sync in the Workspace

After confirming or creating the location:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot icon next to the QuickBooks Desktop connection.
5. Click **Sync now**.

This refreshes the location list from QuickBooks Desktop.

---

## Retry the Export

1. Open the report.
2. Retry exporting to QuickBooks Desktop.

If the location exists and is active, the export should complete successfully.

---

# FAQ

## Does the DESK09 Error Mean My Integration Is Disconnected?

No. It means the selected location cannot be found in QuickBooks Desktop.

## Do I Need to Create a New Location?

Only if the original location was deleted and cannot be reactivated.

## Will Running Sync Automatically Fix It?

Running **Sync now** will refresh the location list, but the location must first exist and be active in QuickBooks Desktop.
