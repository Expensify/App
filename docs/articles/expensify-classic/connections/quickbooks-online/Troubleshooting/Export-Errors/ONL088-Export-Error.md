---
title: ONL088 Export Error in QuickBooks Online Integration
description: Learn what the ONL088 export error means in QuickBooks Online and how to resolve employee and vendor record conflicts.
keywords: ONL088, QuickBooks Online export error, error creating vendor QuickBooks, employee already exists QuickBooks, duplicate employee vendor conflict, Expensify QuickBooks Online integration, Workspace Admin
internalScope: Audience is Workspace Admins using the QuickBooks Online integration. Covers resolving the ONL088 export error caused by employee and vendor name conflicts. Does not cover other QuickBooks Online error codes.
---

# ONL088 Export Error in QuickBooks Online Integration

If you see the error:

ONL088: Error creating vendor. Employee already exists in QuickBooks Online.

This means the report creator already exists as an **Employee** in QuickBooks Online, and Expensify is attempting to create a **Vendor** record with the same name, preventing the export from completing.

QuickBooks Online does not allow an Employee and Vendor to share the same display name.

---

## Why the ONL088 Export Error Happens in QuickBooks Online

The ONL088 error typically indicates:

- Reimbursable expenses are exporting as Vendor Bills.
- Expensify is attempting to automatically create a Vendor record.
- The report creator already exists as an Employee in QuickBooks Online.
- QuickBooks blocks duplicate name records across Employees and Vendors.

This is a QuickBooks Online record conflict issue, not a Workspace configuration issue.

---

## How to Fix the ONL088 Export Error

You can resolve this by updating record names or manually managing Vendor records.

### Option 1: Edit the Employee Name in QuickBooks Online

1. Log in to QuickBooks Online.
2. Go to **Employees**.
3. Locate the employee record with the same name as the report creator.
4. Edit the employee’s display name so it differs from the Vendor name.
5. Save your changes.

After updating QuickBooks Online:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Sync Now**.

Then retry exporting the report.

---

### Option 2: Manually Create Vendor Records and Disable Automatic Entity Creation

If you prefer to control Vendor creation manually:

1. Log in to QuickBooks Online.
2. Go to **Vendors**.
3. Manually create Vendor records with email addresses that exactly match the emails used in Expensify.
4. Save your changes.

Then in Expensify:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Click **Configure**.
5. Open the **Advanced** tab.
6. Disable **Automatically Create Entities**.
7. Click **Save**.
8. Click **Sync Now**.

Retry exporting the report.

---

# FAQ

## Can I Retry the Export?

Yes. After resolving the name conflict and selecting **Sync Now**, retry the export.

## Does ONL088 Mean My QuickBooks Connection Is Broken?

No. The connection is active. QuickBooks is blocking the creation of a duplicate Vendor record.

## Should Employees Be Vendors or Employees in QuickBooks?

This depends on your accounting workflow. If exporting as Vendor Bills, Vendor records must exist and cannot conflict with Employee records.
