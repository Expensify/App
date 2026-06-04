---
title: ONL297 Export Error in QuickBooks Online
description: Learn how to fix the ONL297 export error in QuickBooks Online by syncing your Workspace and updating invalid customer, project, or location tags.
keywords: ONL297, QuickBooks Online customer not found, customer not found on workspace, project tag error, location tag error, Sync now, Expensify QuickBooks Online export error, reselect customer project, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL297 export error caused by invalid or out-of-sync customer, project, or location tags. Does not cover other export error codes.
---

# ONL297 Export Error in QuickBooks Online

If you see the error:

ONL297: Customer not found on workspace. Please sync your QuickBooks Online connection.

This means one or more customer, project, or location tags on the report are no longer valid or are out of sync with QuickBooks Online.

---

## Why the ONL297 Export Error Happens in QuickBooks Online

The ONL297 error occurs when:

- A customer, project, or location tag used on the report no longer exists in QuickBooks Online.
- The record was renamed, deleted, or made inactive in QuickBooks Online.
- The Workspace has not been synced since changes were made in QuickBooks Online.
- The customer, project, or location name in QuickBooks Online contains unsupported characters, such as a forward slash (/).

When tags fall out of sync, Expensify cannot match them to QuickBooks Online during export.

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

After the sync completes, open the report to review the tags.

---

## How to Update Invalid Customer, Project, or Location Tags

1. Open the report that failed to export.
2. Look for any customer, project, or location fields highlighted in red.
3. Click into each affected expense.
4. Reselect the correct customer, project, or location from the synced list.
5. Save your changes.

All tags must match active records in QuickBooks Online before exporting.

---

## How to Fix Special Characters in Customer or Project Names

If the error continues after syncing:

1. In QuickBooks Online, review the customer, project, or location names.
2. Check for forward slashes ( / ) in the name.
3. Replace the forward slash with another character, such as a dash ( - ).
4. Save the changes in QuickBooks Online.
5. Return to Expensify and run **Sync now** again.
6. Open the report and reselect the updated tag.
7. Retry exporting the report.

---

# FAQ

## Does ONL297 Mean My QuickBooks Online Connection Is Broken?

Not usually. This error typically means a customer, project, or location tag is outdated or no longer matches an active record in QuickBooks Online.

## Do I Need to Reselect Tags After Syncing?

Yes. If a tag was previously invalid or highlighted in red, you must reselect it from the updated list before exporting the report.
