---
title: ONL945 Export Error in QuickBooks Online
description: Learn how to fix the ONL945 export error in QuickBooks Online when a vendor cannot be found due to duplicate or conflicting email records.
keywords: ONL945, QuickBooks Online vendor not found, supplier not found error, duplicate email QuickBooks Online, vendor email conflict, Sync now, Expensify QuickBooks Online export error, Workspace Admin, accounting export error
internalScope: Audience is Workspace Admins using QuickBooks Online integration. Covers fixing the ONL945 export error caused by duplicate or conflicting vendor email records. Does not cover other export error codes.
---

# ONL945 Export Error in QuickBooks Online

If you see the error:

ONL945: Vendor/supplier not found. The submitter’s email may be linked to another record in QuickBooks Online.

This means Expensify cannot match the report submitter to a vendor record in QuickBooks Online, usually because the email address is associated with another record.

---

## Why the ONL945 Export Error Happens in QuickBooks Online

The ONL945 error occurs when:

- The vendor record Expensify is attempting to locate uses an email address that is already associated with another record in QuickBooks Online.
- Multiple records (such as vendor and employee) share the same email address.
- QuickBooks Online cannot determine which record to use during export.

Expensify relies on exact email matches to identify vendor records during export.

---

## How to Check for Duplicate Email Records in QuickBooks Online

1. Log in to QuickBooks Online.
2. Use the global search bar at the top of the screen.
3. Search for the report creator or submitter’s email address.
4. Review all records returned (vendor, employee, customer, etc.).
5. Identify any duplicate records using the same email address.
6. Remove or deactivate duplicate entries as appropriate.
7. Save your changes.

After cleaning up duplicate records, refresh your connection in Expensify.

---

## How to Sync QuickBooks Online in Expensify

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

Once the sync completes, retry exporting the report.

---

# FAQ

## Does the Vendor Email Have to Be Unique in QuickBooks Online?

Yes. The email address used to match vendors during export should only be associated with one active record in QuickBooks Online.

## Do I Need to Reconnect QuickBooks Online?

No. In most cases, removing duplicate records and running **Sync now** resolves the issue.
