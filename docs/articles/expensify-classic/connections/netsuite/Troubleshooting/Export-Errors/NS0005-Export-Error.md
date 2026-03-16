---
title: NS0005 Export Error in NetSuite Integration
description: Learn how to fix the NS0005 export error in NetSuite when required classification fields like Department, Location, or Class are missing.
keywords: NS0005, NetSuite required department location class, vendor bill classification error, journal entry classification error, default department NetSuite employee, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0005 export error caused by missing required classification fields. Does not cover other NetSuite error codes.
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
