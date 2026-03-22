---
title: INT446 Export Error in Sage Intacct Integration
description: Learn what the INT446 export error means and how to remove the On Hold status from a vendor in Sage Intacct before retrying the export.
keywords: INT446, Sage Intacct vendor on hold, VEN error Sage Intacct, vendor on hold export error, Sage Intacct vendor Additional Info tab, Sync Now Sage Intacct, Expensify Sage Intacct integration, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT446 export error caused by vendors marked as On Hold. Does not cover employee record or tax configuration errors.
---

# INT446 Export Error in Sage Intacct Integration

If you see the error:

INT446 Export Error: Vendor VEN-[XXXXXX] is marked as 'On Hold' in Sage Intacct. Please remove the hold and try exporting again.

This means the vendor associated with the report is currently marked as **On Hold** in Sage Intacct.

Sage Intacct prevents transactions from being posted to vendors that are on hold.

---

## Why the INT446 Export Error Happens in Sage Intacct

The INT446 error typically indicates:

- The vendor tied to the report exists in Sage Intacct.
- The vendor record is marked as **On Hold**.
- Sage Intacct validation failed because transactions cannot be posted to vendors on hold.

When a vendor is on hold, Sage Intacct blocks new transactions, including exports from Expensify.

This is a vendor status issue in Sage Intacct, not an employee record or tax configuration error.

---

## How to Fix the INT446 Export Error

Follow the steps below to remove the hold and retry the export.

### Remove the On Hold Status from the Vendor in Sage Intacct

1. Log in to Sage Intacct.
2. Open the vendor record associated with the report (referenced as VEN-[XXXXXX] in the error message).
3. Click the **Additional Info** tab.
4. Uncheck the **On Hold** option.
5. Click **Save**.

### Sync the Workspace in Expensify

After updating the vendor:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

If the vendor is no longer marked as On Hold, the export should complete successfully.

---

# FAQ

## Can I Export While the Vendor Is On Hold?

No. Sage Intacct blocks transactions for vendors marked as On Hold.

## Do I Need to Permanently Remove the Hold?

Only if you need to export transactions for that vendor. You can reapply the hold later if required by your accounting process.

## Do I Need Special Permissions to Remove a Vendor Hold?

You need sufficient permissions in Sage Intacct to update vendor records.
