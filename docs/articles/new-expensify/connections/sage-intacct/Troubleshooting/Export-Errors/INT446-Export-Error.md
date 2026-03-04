---
title: INT446 Export Error in Sage Intacct Integration
description: Learn what the INT446 export error means and how to remove the On Hold status from a vendor in Sage Intacct before retrying the export.
keywords: INT446, Sage Intacct vendor on hold error, VEN vendor on hold Intacct, Sage Intacct Additional Info tab vendor, export failure vendor on hold, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT446 export error caused by vendors marked as On Hold. Does not cover employee, tax, or category configuration errors.
---

# INT446 Export Error in Sage Intacct Integration

If you see the error:

INT446 Export Error: Vendor VEN-[XXXXXX] is marked as 'On Hold' in Sage Intacct. Please remove the hold and try exporting again.

This means the vendor associated with the report is currently marked as **On Hold** in Sage Intacct.

Sage Intacct prevents transactions from being posted to vendors that are on hold.

---

## Why the INT446 Export Error Happens in Sage Intacct

The INT446 error typically occurs when:

- The vendor tied to the report exists in Sage Intacct.
- The vendor record is marked as **On Hold**.
- The export attempts to create a transaction for that vendor.

When a vendor is on hold, Sage Intacct blocks new transactions, including exports from the Workspace.

This is a vendor status issue, not a configuration or mapping issue.

---

# How to Fix the INT446 Export Error

Follow the steps below to remove the hold and retry the export.

---

## Remove the On Hold Status in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Open the vendor record referenced in the error message (VEN-[XXXXXX]).
3. Click the **Additional Info** tab.
4. Uncheck the **On Hold** option.
5. Click **Save**.

---

## Sync the Workspace

After updating the vendor record:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the vendor is no longer marked as On Hold, the export should complete successfully.

---

# FAQ

## Can I Export While the Vendor Is On Hold?

No. Sage Intacct blocks transactions for vendors marked as On Hold.

## Do I Need to Permanently Remove the Hold?

No. You can remove the hold to complete the export and reapply it later if required by your accounting process.

## Do I Need Special Permissions to Remove a Vendor Hold?

Yes. Updating vendor records typically requires appropriate administrative permissions in Sage Intacct.
