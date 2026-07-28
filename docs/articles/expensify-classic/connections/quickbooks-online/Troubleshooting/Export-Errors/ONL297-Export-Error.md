---
title: ONL297 Export Error in QuickBooks Online Integration
description: Learn what the ONL297 export error means in QuickBooks Online and how to resync and correct invalid customer, project, or location tags.
keywords: ONL297, QuickBooks Online export error, customer not found QuickBooks, invalid customer tag QuickBooks, location tag error QuickBooks, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL297 export error caused by invalid or unsynced customer, project, or location tags. Does not cover other QuickBooks Online error codes.
---

# ONL297 Export Error in QuickBooks Online Integration

If you see the error:

ONL297: Customer not found on workspace.

This means one or more customer, project, or location tags on the report are no longer valid in the Workspace, preventing the export from completing.

---

## Why the ONL297 Export Error Happens in QuickBooks Online

The ONL297 error typically indicates:

- A customer, project, or location was removed or renamed in QuickBooks Online.
- The tag is no longer synced to the Workspace.
- The selected tag contains unsupported characters.
- A manually created tag is being used instead of a synced QuickBooks option.

When tags fall out of sync, Expensify cannot correctly map them to QuickBooks Online.

This is a sync and tag mapping issue, not a connection failure.

---

## How to Fix the ONL297 Export Error

This issue can be resolved by syncing and updating invalid tags.

### Sync the QuickBooks Online Connection

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

This refreshes the list of customers, projects, and locations available in the Workspace.

### Update Invalid Tags on the Report

1. Open the affected report.
2. Look for customer, project, or location fields highlighted in red.
3. Reselect the correct customer, project, or location from the updated list.
4. Save your changes.

All tags must match active options in QuickBooks Online.

### Check for Unsupported Characters

If the error continues:

1. Log in to QuickBooks Online.
2. Review the customer, project, or location name.
3. Remove unsupported characters such as forward slashes (/).
4. Save the changes.

Then return to Expensify, select **Sync Now**, update the tag on the report, and retry exporting.

---

# FAQ

## Can I Retry the Export?

Yes. After syncing and correcting invalid tags, retry the export.

## Does ONL297 Mean My QuickBooks Connection Is Broken?

No. The connection is active. The selected customer, project, or location tag is no longer valid in the Workspace.

## Do I Need to Reconnect QuickBooks Online?

No. Running **Sync Now** and updating invalid tags is typically sufficient.
