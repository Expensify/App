---
title: ONL298 Export Error in QuickBooks Online Integration
description: Learn what the ONL298 export error means in QuickBooks Online and how to resync and correct invalid location tags.
keywords: ONL298, QuickBooks Online export error, locations not found QuickBooks, invalid location tag QuickBooks, QuickBooks location sync error, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL298 export error caused by invalid or unsynced location tags. Does not cover other QuickBooks Online error codes.
---

# ONL298 Export Error in QuickBooks Online Integration

If you see the error:

ONL298: Locations not found on workspace.

This means one or more location tags on the report are no longer valid in the Workspace, preventing the export from completing.

---

## Why the ONL298 Export Error Happens in QuickBooks Online

The ONL298 error typically indicates:

- A location was removed or renamed in QuickBooks Online.
- The location tag is no longer synced to the Workspace.
- The selected location contains unsupported characters.
- A manually created location tag is being used instead of a synced QuickBooks option.

When location tags fall out of sync, Expensify cannot correctly map them to QuickBooks Online.

This is a sync and tag mapping issue, not a connection failure.

---

## How to Fix the ONL298 Export Error

This issue can be resolved by syncing and updating invalid location tags.

### Sync the QuickBooks Online Connection

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes the list of available QuickBooks locations in the Workspace.

### Update Invalid Location Tags on the Report

1. Open the affected report.
2. Look for location fields highlighted in red.
3. Reselect the correct location from the updated list.
4. Save your changes.

All location tags must match active options in QuickBooks Online.

### Check for Unsupported Characters

If the error continues:

1. Log in to QuickBooks Online.
2. Review the location name.
3. Remove unsupported characters such as forward slashes (/).
4. Save the changes.

Then return to Expensify, select **Sync Now**, update the location on the report, and retry exporting.

---

# FAQ

## Can I Retry the Export?

Yes. After syncing and correcting invalid location tags, retry the export.

## Does ONL298 Mean My QuickBooks Connection Is Broken?

No. The connection is active. The selected location tag is no longer valid in the Workspace.

## Do I Need to Reconnect QuickBooks Online?

No. Running **Sync Now** and updating invalid location tags is typically sufficient.
