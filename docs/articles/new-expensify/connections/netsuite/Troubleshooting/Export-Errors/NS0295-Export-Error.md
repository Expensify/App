---
title: NS0295 Export Error in NetSuite Integration
description: Learn what the NS0295 export error means and how to match employee or vendor email addresses between NetSuite and the Workspace.
keywords: NS0295, NetSuite employee not found by email, NetSuite vendor not found by email, email mismatch NetSuite Workspace, employee record email error NetSuite, vendor record email error NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0295 export error caused by missing or mismatched employee or vendor email records. Does not cover subsidiary mismatches or role permission issues.
---

# NS0295 Export Error in NetSuite Integration

If you see the error:

NS0295 Export Error: NetSuite couldn’t find an employee or vendor record with the email [XXXX].

This means NetSuite cannot locate a matching employee or vendor record using the email address associated with the report creator or submitter.

The email address must match exactly between NetSuite and the Workspace.

---

## Why the NS0295 Export Error Happens in NetSuite

The NS0295 error typically occurs when:

- The report creator or submitter does not have an associated **Employee** or **Vendor** record in NetSuite.
- The email address on the NetSuite record does not exactly match the email used in the Workspace.
- There are differences in spelling, capitalization, or formatting.
- The email field is blank on the NetSuite record.

If NetSuite cannot find a matching record by email, the export will fail.

This is an email matching issue, not a subsidiary mismatch or role permission issue.

---

## How to Fix the NS0295 Export Error for Vendor Bills

If you are exporting **Vendor Bills**, update the vendor record in NetSuite.

### Confirm the Vendor Email in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Lists > Vendors**.
3. Locate and edit the vendor record associated with the report creator or submitter.
4. Confirm the **Email** field exactly matches the email used in the Workspace.
5. Click **Save**.

### Sync the Workspace and Retry the Export

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

Then retry exporting the report.

---

## How to Fix the NS0295 Export Error for Journal Entries or Expense Reports

If you are exporting **Journal Entries** or **Expense Reports**, update the employee record in NetSuite.

### Confirm the Employee Email in NetSuite

1. Log in to NetSuite.
2. Go to **Lists > Employees**.
3. Locate and edit the employee record associated with the report creator or submitter.
4. Confirm the **Email** field exactly matches the email used in the Workspace.
5. Click **Save**.

### Sync the Workspace and Retry the Export

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

Then retry exporting the report.

---

# FAQ

## Does the NS0295 Export Error Affect Only One User?

Yes. This error is specific to the employee or vendor record associated with the report.

## Do I Need NetSuite Admin Access to Fix the NS0295 Export Error?

Yes. Editing employee or vendor records in NetSuite requires appropriate permissions.

## Does the Email Have to Match Exactly?

Yes. The email must match exactly, including spelling and formatting, for NetSuite to recognize the record.
