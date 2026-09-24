---
displayTitle: "NS0995 Export Error: The employee with email 'user@example.com' is deactivated in NetSuite"
title: NS0995 Export Error in NetSuite Integration
description: Learn how to fix the NS0995 export error in NetSuite when the report submitter's employee record is deactivated.
keywords: NS0995, NetSuite employee deactivated, inactive employee NetSuite, reactivate employee NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0995 export error caused by an inactive employee record in NetSuite. Does not cover other NetSuite error codes.
---

# NS0995 Export Error in NetSuite Integration

If you see the error:

NS0995: The employee with email 'user@example.com' is deactivated in NetSuite. Reactivate their employee record in NetSuite, sync your connection, and try exporting again.

This means the employee record exists in NetSuite but is marked **Inactive**.

---

## Why the NS0995 Export Error Happens in NetSuite

The NS0995 error occurs when:

- The report submitter's employee record in NetSuite has the **Inactive** box checked.
- The employee left the company, or the record was deactivated during cleanup, while reports from that employee were still waiting to export.

Expensify only imports active employees, so a deactivated employee cannot be matched during export. The record is still in NetSuite, so searching for it will find it — only the inactive status blocks the export.

If NetSuite has no record for the email at all, you will see the NS0023 export error instead.

---

## How to Fix the NS0995 Export Error

### Step One: Reactivate the Employee in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Lists**.
3. Select **Employees**. You may need to check **Show Inactives** to see the record.
4. Locate the employee for the email in the error message.
5. Click **Edit**.
6. On the **System Information** tab, clear the **Inactive** checkbox.
7. Save the record.

---

### Step Two: Sync the Workspace in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

---

### Step Three: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

Once the employee is active and the connection has synced, the export should complete successfully.

---

# FAQ

## Can I Deactivate the Employee Again Afterwards?

Yes, but export all of the employee’s outstanding reports first. Deactivating the record again while any report is still unexported will make those reports fail with NS0995.

## Do I Have to Sync After Reactivating the Employee?

Yes. Expensify reads employees from the data stored at the last sync, so the export will keep failing until you sync the connection.

## Does NS0995 Mean the Integration Is Broken?

No. The connection is working. The export cannot reference an inactive employee record.
