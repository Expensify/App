---
title: NS0077 Export Error in NetSuite Integration
description: Learn how to fix the NS0077 export error in NetSuite when an employee record cannot be created due to role permissions.
keywords: NS0077, NetSuite could not create employee, role does not have permission employee record, NetSuite employee creation error, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0077 export error caused by employee record creation or permission issues. Does not cover other NetSuite error codes.
---

# NS0077 Export Error in NetSuite Integration

If you see the error:

NS0077: Could not create 'employee.' Your current role does not have permission to access this record in NetSuite.

This means Expensify attempted to create an employee record in NetSuite, but the connected role does not have sufficient permissions.

---

## Why the NS0077 Export Error Happens in NetSuite

The NS0077 error occurs when:

- An employee record does not already exist in NetSuite for the report submitter.
- Expensify is configured to automatically create employee records.
- The NetSuite role used for the integration does not have permission to create employee records.
- The Workspace has not been synced recently.

NetSuite blocks the export when the integration role cannot create the required employee record.

---

## How to Fix the NS0077 Export Error

### Step One: Confirm the Workspace Was Recently Synced

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Confirm the Workspace has been synced within the last 24 hours.

If it has not:

1. Click **Sync now**.
2. Retry exporting the report.

---

### Step Two: Retry the Export

1. Open the report in Expensify.
2. Retry exporting to NetSuite.

---

### Step Three: Contact Concierge if the Error Persists

If the Workspace was synced within the last 24 hours and the error continues:

- Reach out to **Concierge**.
- Provide:
  - The Workspace name.
  - The report ID.
  - Confirmation that a recent sync was completed.

Concierge can review the role permissions and integration logs to determine the next steps.

---

# FAQ

## Does NS0077 Mean the Employee Does Not Exist?

Yes. This error usually occurs when NetSuite cannot create or access the employee record for the report submitter.

## Do I Need to Update Role Permissions in NetSuite?

Possibly. If syncing does not resolve the issue, the integration role may need additional permissions to create employee records.
