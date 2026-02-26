---
title: INT088 Export Error: Cash Management Subledger Is Closed in Sage Intacct
description: Learn why the INT088 export error occurs and how to reopen the Cash Management subledger before retrying the export.
keywords: INT088, Cash Management subledger closed, Sage Intacct closed subledger error, reopen Cash Management subledger, export failure closed period
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers the INT088 export error related to a closed Cash Management subledger. Does not cover general accounting period or export date errors.
---

# INT088 Export Error: Cash Management Subledger Is Closed in Sage Intacct

If you see the error message:

**“INT088 Export Error: Cash Management subledger is closed in Sage Intacct. Please open the subledger, export the report, then close the subledger again.”**

It means the **Cash Management** subledger is currently closed in Sage Intacct.

Sage Intacct does not allow new transactions to post to a closed subledger.

---

## Why the INT088 Export Error Happens

The INT088 export error occurs when:

- The **Cash Management** subledger is closed in Sage Intacct, and  
- The export attempts to create a transaction in that module  

When the subledger is closed, Sage Intacct blocks new entries until it is reopened.

---

# How to Fix the INT088 Export Error

Follow the steps below to temporarily open the subledger and complete the export.

---

## Step 1: Open the Cash Management Subledger in Sage Intacct

1. Log in to Sage Intacct.  
2. Go to **Applications > Cash Management > All > Subledger > Open**.  
3. Open the Cash Management subledger.  
4. Save your changes.  

---

## Step 2: Run Sync

1. Go to **Workspaces > [Workspace Name] > Accounting**.  
2. Click the three-dot icon next to the connection.  
3. Select **Sync Now** from the dropdown.  

---

## Step 3: Retry the Export

Return to the report and retry the export.

The export should complete successfully while the subledger is open.

---

## Step 4: Close the Subledger (Optional)

After the export is complete:

1. Log in to Sage Intacct.  
2. Go to **Applications > Cash Management > All > Subledger > Close**.  
3. Close the Cash Management subledger if required by your accounting process.  

---

# FAQ

## Do I need to leave the subledger open?

No. You only need to open it long enough to complete the export. You can close it again afterward.

## Does this error mean the integration is broken?

No. The integration is functioning correctly. The export fails only because Sage Intacct prevents transactions from posting to a closed subledger.

## Do I need special permissions to open or close the subledger?

Yes. Opening or closing a subledger typically requires administrative permissions in Sage Intacct.
