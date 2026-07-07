---
title: NS0023 Export Error in NetSuite Integration
description: Learn what the NS0023 export error means and how to match employee subsidiary and email settings between NetSuite and Expensify.
keywords: NS0023, NetSuite employee does not exist, employee subsidiary mismatch NetSuite, employee email mismatch NetSuite, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0023 export error caused by employee subsidiary or email mismatches. Does not cover role permission or token configuration issues.
---

# NS0023 Export Error in NetSuite Integration

If you see the error:

NS0023 Export Error: Employee does not exist in NetSuite. Please make sure employee’s subsidiary and email matches between NetSuite and Expensify.

This means NetSuite cannot find a matching employee record for the report creator or submitter.

Exports require the employee’s subsidiary and email address to match exactly between NetSuite and the Workspace.

---

## Why the NS0023 Export Error Happens in NetSuite

The NS0023 error typically occurs when:

- The employee’s **subsidiary** in NetSuite does not match the subsidiary used in the Workspace.
- The employee’s **email address** does not match between NetSuite and the Workspace.
- The employee record does not exist in the selected NetSuite subsidiary.

If either the subsidiary or email differs, NetSuite cannot match the employee during export.

This is an employee record configuration issue, not a role permission or token configuration issue.

---

## How to Fix the NS0023 Export Error

Follow the steps below to confirm and correct the employee record.

### Confirm Employee Settings in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Employees**.
3. Locate the employee profile associated with the report creator or submitter.
4. Confirm the following:
   - The **Subsidiary** matches the subsidiary configured in the Workspace.
   - The **Email address** exactly matches the email used in the Workspace.
5. Click **Save** if changes were made.

### Sync the Workspace in Expensify

After confirming or updating the employee record:

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

### Retry the Export

1. Open the report.
2. Retry exporting to NetSuite.

If the employee’s subsidiary and email match exactly, the export should complete successfully.

---

# FAQ

## Does the NS0023 Export Error Affect All Reports From This Employee?

Yes. If the employee record does not match, all exports tied to that employee will fail until the mismatch is corrected.

## Do I Need NetSuite Admin Access to Fix the NS0023 Export Error?

Yes. Updating employee records in NetSuite requires appropriate permissions.

## Does the Email Have to Match Exactly?

Yes. The email address must match exactly, including spelling and formatting.
