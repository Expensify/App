---
title: NS0005 Export Error in NetSuite Integration
description: Learn what the NS0005 export error means and how to configure required Department, Location, or Class fields in NetSuite for vendor bills, journal entries, or expense reports.
keywords: NS0005, NetSuite missing Department Location Class, vendor bill classification error NetSuite, journal entry export error NetSuite, expense report classification error NetSuite, Expensify NetSuite integration, Workspace Admin
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers resolving the NS0005 export error caused by missing Department, Location, or Class values for different export types. Does not cover role permission or token issues.
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
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Retry exporting the report after the sync completes.

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
3. Click **Accounting**.
4. Click the three-dot menu next to the NetSuite connection.
5. Click **Sync Now**.

On mobile:

1. Tap the navigation tabs on the bottom and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the three-dot menu next to the NetSuite connection.
5. Tap **Sync Now**.

Retry exporting the report once the sync completes.

---

# FAQ

## Does the NS0005 Export Error Affect All Export Types?

No. The resolution depends on whether you are exporting a vendor bill, journal entry, or expense report.

## Do I Need NetSuite Admin Access to Fix the NS0005 Export Error?

Yes. Updating transaction forms or employee records in NetSuite requires appropriate permissions.

## Can I Make Department, Location, or Class Optional Instead?

Yes. For vendor bill exports, you can remove the **Mandatory** requirement from the preferred transaction form in NetSuite.
