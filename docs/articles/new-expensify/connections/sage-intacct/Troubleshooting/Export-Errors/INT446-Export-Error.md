---
title: INT446 Export Error: Vendor Is Marked as On Hold in Sage Intacct
description: Learn why the INT446 export error occurs and how to remove the On Hold status from a vendor in Sage Intacct before retrying the export.
keywords: INT446, vendor on hold Sage Intacct, VEN error Sage Intacct, vendor additional info tab, export failure vendor on hold
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT446 export error related to vendors marked as On Hold. Does not cover employee, tax, or category configuration errors.
---

# INT446 Export Error: Vendor Is Marked as On Hold in Sage Intacct

If you see the error message:

**“INT446 Export Error: Vendor VEN-[XXXXXX] is marked as 'On Hold' in Sage Intacct. Please remove the hold and try exporting again.”**

It means the vendor associated with the report is currently marked as **On Hold** in Sage Intacct.

Sage Intacct prevents transactions from being posted to vendors that are on hold.

---

## Why the INT446 Export Error Happens

The INT446 export error occurs when:

- The vendor tied to the report exists in Sage Intacct, and  
- The vendor record is marked as **On Hold**  

When a vendor is on hold, Sage Intacct blocks new transactions, including exports.

---

# How to Fix the INT446 Export Error

Follow the steps below to remove the hold and retry the export.

---

## Step 1: Remove the On Hold Status in Sage Intacct

1. Log in to Sage Intacct.  
2. Open the vendor record referenced in the error message (VEN-[XXXXXX]).  
3. Click the **Additional Info** tab.  
4. Uncheck the **On Hold** option.  
5. Save your changes.  

---

## Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

If the vendor is no longer marked as On Hold, the export should complete successfully.

---

# FAQ

## Can I export while the vendor is On Hold?

No. Sage Intacct blocks transactions for vendors marked as On Hold.

## Do I need to permanently remove the hold?

Only if you need to export transactions for that vendor. You can reapply the hold later if required by your accounting process.

## Do I need special permissions to remove a vendor hold?

Yes. Updating vendor records typically requires appropriate permissions in Sage Intacct.
