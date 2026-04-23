---
title: NS0885 Export Error in NetSuite Integration
description: Learn how to fix the NS0885 export error in NetSuite when required field values are missing during export.
keywords: NS0885, NetSuite missing value export error, required field missing NetSuite, uncheck show field transaction form, NetSuite employee default import option, Expensify NetSuite export error, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers fixing the NS0885 export error caused by required NetSuite fields not being populated during export. Does not cover other NetSuite error codes.
---

# NS0885 Export Error in NetSuite Integration

If you see the error:

NS0885: Missing value(s) for [X].

This means NetSuite requires a field value that is not being populated during export from Expensify.

The resolution depends on the export type and whether the expenses are reimbursable or non-reimbursable.

---

# Why the NS0885 Export Error Happens in NetSuite

The NS0885 error occurs when:

- A required field on the preferred NetSuite form is visible and mandatory.
- A classification (Department, Location, Class) is required but not available.
- An imported tag from Expensify is not valid in NetSuite.
- A field is required at the form level but Expensify does not populate it.

NetSuite blocks the export when required fields are blank.

---

# How to Fix NS0885 for Reimbursable Exports

## If Exporting as an Expense Report

1. In NetSuite, go to **Customization** > **Forms** > **Transaction Forms**.
2. Click **Edit** next to the preferred **Expense Report** form.
3. Locate the field mentioned in the error message:
   - Check under **Screen Fields > Main**
   - Or **Screen Fields > Expenses**
4. Uncheck **Show** for the required field.
5. Save the form.

If the error mentions an imported tag (Department, Location, or Class):

1. In Expensify, go to **Settings** > **Workspaces** > **Accounting**.
2. Click **Configure**.
3. Open the **Coding** tab.
4. Change the import option from **Tag** to **NetSuite Employee Default**.
5. Click **Save**.

Retry exporting the report.

---

## If Exporting as a Vendor Bill

1. In NetSuite, go to **Customization** > **Forms** > **Transaction Forms**.
2. Click **Edit** next to the preferred **Vendor Bill** form.
3. If the report total is negative, select the **Bill Credit** form.
4. Locate the field mentioned in the error.
5. Uncheck **Show**.
6. Save the form.

Then in Expensify:

1. Go to **Settings** > **Workspaces** > **Accounting**.
2. Click **Sync**.
3. Retry exporting the report.

---

## If Exporting as a Journal Entry

1. In NetSuite, go to **Customization** > **Forms** > **Transaction Forms**.
2. Click **Edit** next to the preferred **Journal Entry** form.
3. Locate the field mentioned in the error.
4. Uncheck **Show**.
5. Save the form.

If the error mentions Department, Location, or Class:

1. In Expensify, go to **Settings** > **Workspaces** > **Accounting**.
2. Click **Configure**.
3. Open the **Coding** tab.
4. Change the import option from **Tag** to **NetSuite Employee Default**.
5. Click **Save**.

Retry exporting the report.

---

# How to Fix NS0885 for Non-Reimbursable Exports

## If Exporting as an Expense Report

1. In NetSuite, use the global search bar.
2. Search for the report submitter’s email address.
3. Confirm there are not multiple employee or vendor records.
4. Update the field mentioned in the error on all matching records.
5. Save changes.

Then in Expensify:

1. Go to **Settings** > **Workspaces** > **Accounting**.
2. Click **Sync**.
3. Retry exporting the report.

---

## If Exporting as a Vendor Bill

1. In NetSuite, go to **Customization** > **Forms** > **Transaction Forms**.
2. Edit the preferred **Vendor Bill** form.
3. If the report total is negative, use the **Bill Credit** form.
4. Locate the field mentioned in the error.
5. Uncheck **Show**.
6. Save the form.

Then:

1. In Expensify, go to **Settings** > **Workspaces** > **Accounting**.
2. Click **Sync**.
3. Retry exporting the report.

---

## If Exporting as a Journal Entry

1. In NetSuite, go to **Customization** > **Forms** > **Transaction Forms**.
2. Edit the preferred **Journal Entry** form.
3. Locate the field mentioned in the error.
4. Uncheck **Show**.
5. Save the form.

If the error references Department, Location, or Class:

1. In Expensify, go to **Settings** > **Workspaces** > **Accounting**.
2. Click **Configure**.
3. Open the **Coding** tab.
4. Change the import option from **Tag** to **NetSuite Employee Default**.
5. Click **Save**.

Retry exporting the report.

---

# FAQ

## Does NS0885 Mean the Field Is Deleted?

Not necessarily. The field may exist but is required or visible on the NetSuite form and not populated during export.

## Do I Need to Reconnect NetSuite?

No. Updating the form visibility, role permissions, or coding configuration and running **Sync** is typically sufficient.
