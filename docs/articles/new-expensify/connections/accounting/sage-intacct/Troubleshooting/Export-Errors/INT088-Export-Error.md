---
title: INT088 Export Error in Sage Intacct Integration
description: Learn what the INT088 export error means and how to reopen the Cash Management subledger in Sage Intacct before retrying the export.
keywords: INT088, Sage Intacct Cash Management subledger closed, reopen Cash Management subledger Intacct, closed subledger export error Sage Intacct, Workspace Admin
internalScope: Audience is Workspace Admins using the Sage Intacct integration. Covers resolving the INT088 export error caused by a closed Cash Management subledger. Does not cover general accounting period or export date errors.
---

# INT088 Export Error in Sage Intacct Integration

If you see the error:

INT088 Export Error: Cash Management subledger is closed in Sage Intacct. Please open the subledger, export the report, then close the subledger again.

This means the **Cash Management** subledger is currently closed in Sage Intacct.

Sage Intacct does not allow new transactions to post to a closed subledger.

---

## Why the INT088 Export Error Happens in Sage Intacct

The INT088 error typically occurs when:

- The **Cash Management** subledger is closed.
- The export attempts to create a transaction in the Cash Management module.

When a subledger is closed, Sage Intacct blocks all new entries until it is reopened.

This is a subledger status issue, not a connection or configuration issue.

---

# How to Fix the INT088 Export Error

Follow the steps below to temporarily open the subledger and complete the export.

---

## Open the Cash Management Subledger in Sage Intacct

1. Log in to Sage Intacct as an administrator.
2. Go to **Applications > Cash Management > All > Subledger > Open**.
3. Open the Cash Management subledger.
4. Click **Save**.

---

## Sync the Workspace

After reopening the subledger:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

---

## Retry the Export

1. Open the report.
2. Retry exporting to Sage Intacct.

The export should complete successfully while the subledger is open.

---

## Close the Subledger (Optional)

After the export is complete:

1. Log in to Sage Intacct.
2. Go to **Applications > Cash Management > All > Subledger > Close**.
3. Close the Cash Management subledger if required by your accounting process.

---

# FAQ

## Do I Need to Leave the Subledger Open?

No. You only need to open it long enough to complete the export. You can close it again afterward.

## Does This Error Mean the Integration Is Broken?

No. The integration is functioning correctly. The export fails only because Sage Intacct prevents transactions from posting to a closed subledger.

## Do I Need Special Permissions to Open or Close the Subledger?

Yes. Opening or closing a subledger typically requires administrative permissions in Sage Intacct.
