---
title: NS0898 Sync Error in NetSuite Integration
description: Learn how to fix the NS0898 sync error in NetSuite when approval settings are misaligned between NetSuite and Expensify.
keywords: NS0898, NetSuite incorrect approval settings, approval level mismatch NetSuite Expensify, supervisor and accounting approval, approved for posting NetSuite, Expensify NetSuite sync error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0898 sync error caused by mismatched approval configurations. Does not cover other NetSuite error codes.
---

# NS0898 Sync Error in NetSuite Integration

If you see the error:

NS0898: Incorrect approval settings. Please adjust approval level in either NetSuite or Expensify configurations.

This means the approval requirements in Expensify do not match the approval expectations in NetSuite.

---

## Why the NS0898 Sync Error Happens in NetSuite

The NS0898 error occurs when:

- The approval level in Expensify is lower than what NetSuite requires.
- NetSuite expects transactions to be **Approved for Posting**.
- The Workspace is configured with insufficient approval settings.
- The export type requires a higher approval level before syncing.

NetSuite will not accept transactions that do not meet its configured approval requirements.

---

## How to Fix the NS0898 Sync Error

### Step One: Update Approval Settings in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Configure**.
6. Open the **Advanced** tab.

Adjust the approval level based on the export type:

- **Expense Reports** — Select **Supervisor & Accounting Approved**
- **Vendor Bills** — Select **Approved for Posting**
- **Journal Entries** — Select **Approved for Posting**

7. Click **Save**.

---

### Step Two: Confirm Report Status

1. Open the report in Expensify.
2. Confirm the report has completed the required approval workflow.
3. Ensure it is fully approved before syncing.

---

### Step Three: Retry the Sync

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Once approval settings align between NetSuite and Expensify, the sync should complete successfully.

---

# FAQ

## Does NS0898 Mean the Report Was Rejected?

No. It means the report does not meet the required approval level for NetSuite.

## Do I Need to Change Approval Settings in NetSuite?

Usually, adjusting the approval level in Expensify to match NetSuite requirements resolves the issue.
