---
title: NS0005 Export Error in NetSuite Integration
description: Learn how to fix NS0005 classification errors and related required-field errors, including missing Line of Business values on NetSuite vendor bills.
keywords: NS0005, NetSuite missing Department Location Class, Line of Business, Please enter values for, required custom field, vendor bill header, expense lines, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is workspace admins using the NetSuite integration. Covers NS0005 classification errors and related required custom-field errors on vendor bills. Does not cover role permission or token issues.
---

# NS0005 Export Error in NetSuite Integration

If you see the error:

NS0005: Please enter value(s) for 'department', 'location', or 'class' and attempt to export again.

This means NetSuite requires classification fields (Department, Location, or Class) that are missing from the export.

The resolution depends on your export type.

---

## Why the NS0005 Export Error Happens in NetSuite

The NS0005 error occurs when:

- Department, Location, or Class fields are marked as mandatory in NetSuite.
- Required classification values are not present on the vendor bill.
- Required classification values are not set on the employee record (for journal entry or expense report exports).
- Default values are missing in NetSuite configuration.

NetSuite blocks exports when required classification fields are blank.

---

# How to Fix NS0005 for Vendor Bill Exports

If you are exporting as a **Vendor Bill**:

### Step One: Update the Vendor Bill Form in NetSuite

1. Log in to **NetSuite** as an Administrator.
2. Go to **Customization**.
3. Select **Forms**.
4. Click **Transaction Forms**.
5. Click **Edit** next to the Vendor Bill form marked as **Preferred**.
6. Go to **Screen Fields**.
7. Click the **Main** subtab.
8. Locate the fields:
   - Department
   - Location
   - Class
9. Uncheck both:
   - **Show**
   - **Mandatory**
10. Save the form.

---

### Step Two: Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry exporting the report.

---

## How to fix a required Line of Business field on a NetSuite vendor bill

You may also see this related NetSuite error without an NS0005 code:

> Error while accessing a resource. Please enter value(s) for: Line of Business.

NetSuite requires a value for the named field. The requirement may apply to the bill header, expense lines, or both. Ask your NetSuite administrator to confirm where the field is required before changing the form.

- If the field must remain required, confirm its mapping and selected values in Expensify. For custom segments, report-level coding uses a **Report Field** and expense-line coding uses a **Tag**. Check both levels if NetSuite requires both.
- If the administrator confirms the field does not need to appear on the export form, follow the form steps below. Do not remove a business-required field just to bypass the error.

Learn how to [configure NetSuite custom segments and records](/articles/expensify-classic/connections/netsuite/Configure-Netsuite).

1. In NetSuite, go to **Customization > Forms > Transaction Forms**.
2. Select **Edit** next to the preferred vendor bill form.
3. Find the field named in the error under **Screen Fields > Main** for the header and **Screen Fields > Expenses** for expense lines. Check both if the field is required at both levels.
4. Clear **Show** for the field. If **Mandatory** is selected, clear it only if your administrator confirms the requirement can be removed.
5. Select **Save**.
6. Sync the workspace using the steps above, then retry the export.

If the next export returns a billable-expense error, troubleshoot it separately. Learn how to [correct NetSuite billable expense coding](/articles/expensify-classic/connections/netsuite/Troubleshooting/Export-Errors/NS0046-Export-Error).

---

# How to Fix NS0005 for Journal Entry or Expense Report Exports

If you are exporting as a **Journal Entry** or **Expense Report**:

### Step One: Update the Employee Record in NetSuite

1. Log in to **NetSuite**.
2. Go to **Lists**.
3. Select **Employees**.
4. Edit the employee profile associated with the report creator’s email address.
5. Set default values for:
   - Department
   - Class
   - Location
6. Save the employee record.

---

### Step Two: Sync in Expensify

1. In Expensify, go to **Settings**.
2. Select **Workspaces**.
3. Select your Workspace.
4. Click **Accounting**.
5. Click **Sync**.

Retry exporting the report.

---

# FAQ

## Do I Need to Set Department, Location, and Class for Every Employee?

Only if those fields are required in your NetSuite configuration. If they are mandatory, default values must be set.

## Does This Error Mean My Integration Is Broken?

No. This error is caused by missing required classification fields in NetSuite.
