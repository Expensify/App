---
title: NS0005 Export Error in NetSuite Integration
description: Learn how to fix NS0005 classification errors and related required-field errors, including missing Line of Business values on NetSuite vendor bills.
keywords: NS0005, NetSuite missing Department Location Class, Line of Business, Please enter values for, required custom field, vendor bill header, expense lines, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is workspace admins using the NetSuite integration. Covers NS0005 classification errors and related required custom-field errors on vendor bills. Does not cover role permission or token issues.
---

# NS0005 Export Error in NetSuite Integration

If you see the error:

NS0005 Export Error: Please enter value(s) for 'department', 'location', or 'class' and attempt to export again.

This means required classification fields are missing in NetSuite.

This typically affects:

- Vendor bill exports  
- Journal entry exports  
- Expense report exports  

The fix depends on the export type.

---

## Why the NS0005 Export Error Happens in NetSuite

The NS0005 error occurs when required classification fields such as:

- **Department**
- **Location**
- **Class**

are not populated on the transaction or employee record in NetSuite.

Depending on your export type, these values must either:

- Be removed as required fields on the transaction form, or  
- Be set as default values on the employee record  

This is a NetSuite classification configuration issue, not a role permission or token issue.

---

## Fix the NS0005 Export Error for Vendor Bills

If you are exporting **vendor bills**, update the preferred vendor bill form in NetSuite.

### Update the Vendor Bill Form in NetSuite

1. Log in to NetSuite as an administrator.
2. Go to **Customization > Forms > Transaction Forms**.
3. Click **Edit** next to the vendor bill form marked as preferred.
4. Go to **Screen Fields > Main**.
5. Locate **Department**, **Location**, and **Class**.
6. Uncheck both **Show** and **Mandatory** for each field.
7. Click **Save**.

### Sync the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Select **More (⋮)**.
5. Select **Sync now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Select **More (⋮)**.
5. Select **Sync now**.

Retry exporting the report after the sync completes.

---

## How to fix a required Line of Business field on a NetSuite vendor bill

You may also see this related NetSuite error without an NS0005 code:

> Error while accessing a resource. Please enter value(s) for: Line of Business.

NetSuite requires a value for the named field. The requirement may apply to the bill header, expense lines, or both. Ask your NetSuite administrator to confirm where the field is required before changing the form.

- If the field must remain required, confirm its mapping and selected values in Expensify. For custom segments, report-level coding uses a **Report Field** and expense-line coding uses a **Tag**. Check both levels if NetSuite requires both.
- If the administrator confirms the field does not need to appear on the export form, follow the form steps below. Do not remove a business-required field just to bypass the error.

Learn how to [configure NetSuite custom segments and records](/articles/new-expensify/connections/netsuite/Configure-Netsuite).

1. In NetSuite, go to **Customization > Forms > Transaction Forms**.
2. Select **Edit** next to the preferred vendor bill form.
3. Find the field named in the error under **Screen Fields > Main** for the header and **Screen Fields > Expenses** for expense lines. Check both if the field is required at both levels.
4. Clear **Show** for the field. If **Mandatory** is selected, clear it only if your administrator confirms the requirement can be removed.
5. Select **Save**.
6. Sync the workspace using the steps above, then retry the export.

If the next export returns a billable-expense error, troubleshoot it separately. Learn how to [correct NetSuite billable expense coding](/articles/new-expensify/connections/netsuite/Troubleshooting/Export-Errors/NS0046-Export-Error).

---

## Fix the NS0005 Export Error for Journal Entries or Expense Reports

If you are exporting **journal entries** or **expense reports**, update the employee record in NetSuite.

### Set Default Classification Values on the Employee Record

1. Log in to NetSuite.
2. Go to **Lists > Employees**.
3. Locate and edit the employee profile associated with the report creator or submitter.
4. Set default values for:
   - **Department**
   - **Class**
   - **Location**
5. Click **Save**.

### Sync the Workspace

On web:

1. Go to the navigation tabs on the left and select **Workspaces**.
2. Select your Workspace.
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Select **More (⋮)**.
5. Select **Sync now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Select **Connections**, then select **Configure** next to NetSuite.
4. Select **More (⋮)**.
5. Select **Sync now**.

Retry exporting the report once the sync completes.

---

# FAQ

## Does the NS0005 Export Error Affect All Export Types?

No. The resolution depends on whether you are exporting a vendor bill, journal entry, or expense report.

## Do I Need NetSuite Admin Access to Fix the NS0005 Export Error?

Yes. Updating transaction forms or employee records in NetSuite requires appropriate permissions.

## Can I Make Department, Location, or Class Optional Instead?

Yes. For vendor bill exports, you can remove the **Mandatory** requirement from the preferred transaction form in NetSuite.
