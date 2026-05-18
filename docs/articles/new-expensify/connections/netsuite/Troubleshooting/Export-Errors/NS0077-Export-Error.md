---
title: NS0077 Export Error in NetSuite Integration
description: Learn what the NS0077 export error means and how to sync your Workspace or contact Concierge to resolve employee creation permission issues in NetSuite.
keywords: NS0077, NetSuite could not create employee, employee record permission error NetSuite, Expensify NetSuite export error, sync Workspace NetSuite, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0077 export error caused by employee record creation permission issues or outdated sync status. Does not cover detailed role permission configuration steps.
---

# NS0077 Export Error in NetSuite Integration

If you see the error:

NS0077 Export Error: Could not create 'employee.' Your current role does not have permission to access this record in NetSuite.

This means the integration attempted to create an employee record in NetSuite but was blocked by permissions.

This typically happens when the connected NetSuite role does not have sufficient access or the Workspace has not recently synced.

---

## Why the NS0077 Export Error Happens in NetSuite

The NS0077 error typically occurs when:

- An employee record needs to be created in NetSuite during export.
- The integration role does not have permission to create or access **Employee** records.
- The Workspace has not synced recently and employee data is outdated.
- The employee does not yet exist in NetSuite.

If NetSuite blocks the employee record creation, the export will fail.

This is an employee creation or role permission issue, not a token authentication issue.

---

## How to Fix the NS0077 Export Error

Follow the steps below to confirm sync status and retry the export.

---

## Confirm the Workspace Has Synced Recently

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Confirm the last sync occurred within the past 24 hours.

If it has not synced recently:

1. Click the three-dot menu next to the NetSuite connection.
2. Click **Sync Now**.
3. Retry exporting the report.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.
6. Retry exporting the report.

---

## Contact Concierge if the Error Persists

If the Workspace has synced recently and the error continues:

1. Do not delete the report.
2. Reach out to **Concierge**.
3. Include:
   - The report ID.
   - Confirmation that you’re seeing **NS0077**.
   - The approximate time the export was attempted.

Additional role permissions or configuration updates in NetSuite may be required.

---

# FAQ

## Does the NS0077 Export Error Affect All New Employees?

It may affect exports for employees who do not already exist in NetSuite.

## Do I Need NetSuite Admin Access to Fix the NS0077 Export Error?

You may need NetSuite administrator assistance if additional role permissions are required.

## Will Syncing Always Fix This Error?

Syncing can resolve the issue if it is caused by outdated employee data. If the problem is related to role permissions, NetSuite configuration changes may be required.
