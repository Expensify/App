---
title: ONL298 Export Error in QuickBooks Online
description: Learn how to fix the ONL298 export error in QuickBooks Online by syncing your Workspace and updating invalid location tags.
keywords: ONL298, QuickBooks Online locations not found, location tag error, Sync now, reselect location tag, QuickBooks Online location export error, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL298 export error caused by invalid or out-of-sync location tags. Does not cover other export error codes.
---

# ONL298 Export Error in QuickBooks Online

If you see the error:

ONL298: Locations not found on workspace. Please sync your QuickBooks Online connection.

This means one or more location tags or report-level location fields on the report are no longer valid or are out of sync with QuickBooks Online.

---

## Why the ONL298 Export Error Happens in QuickBooks Online

The ONL298 error occurs when:

- A location tag used on the report no longer exists in QuickBooks Online.
- The location was renamed, deleted, or made inactive in QuickBooks Online.
- The Workspace has not been synced since changes were made in QuickBooks Online.
- The location name in QuickBooks Online contains unsupported characters, such as a forward slash (/).

When location tags fall out of sync, Expensify cannot match them during export.

---

## How to Sync QuickBooks Online in Expensify

First, refresh your QuickBooks Online connection.

### On Web

1. Go to the **Workspaces** navigation tab on the left.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the **three-dot icon** next to the QuickBooks Online connection.
5. Select **Sync now**.

### On Mobile

1. Tap the **Workspaces** navigation tab on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the QuickBooks Online connection.
5. Tap **Sync now**.

After the sync completes, review the report.

---

## How to Update Invalid Location Tags on a Report

1. Open the report that failed to export.
2. Look for any location fields highlighted in red.
3. Click into each affected expense or report field.
4. Reselect the correct location from the synced list.
5. Save your changes.

All location tags must match active records in QuickBooks Online before exporting.

---

## How to Fix Special Characters in Location Names

If the error continues after syncing:

1. In QuickBooks Online, review the location names.
2. Check for forward slashes ( / ) in the location name.
3. Replace the forward slash with another character, such as a dash ( - ).
4. Save the changes in QuickBooks Online.
5. Return to Expensify and run **Sync now** again.
6. Open the report and reselect the updated location.
7. Retry exporting the report.

---

# FAQ

## Does ONL298 Mean My QuickBooks Online Connection Is Broken?

Not usually. This error typically means a location tag is outdated or no longer matches an active record in QuickBooks Online.

## Do I Need to Reselect Location Tags After Syncing?

Yes. If a location field was previously invalid or highlighted in red, you must reselect it from the updated list before exporting the report.
