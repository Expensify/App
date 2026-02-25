---
title: NS0005 Export Error: Missing Department, Location, or Class Values
description: Learn why the NS0005 export error occurs and how to configure required classification fields in NetSuite for vendor bills, journal entries, or expense reports.
keywords: NS0005, NetSuite missing department location class, vendor bill classification error, journal entry export error NetSuite, expense report classification error, Expensify NetSuite integration
internalScope: Audience is Workspace Admins using the NetSuite integration. Covers the NS0005 export error related to missing Department, Location, or Class values for different export types. Does not cover role permission or token issues.
---

# NS0005 Export Error: Missing Department, Location, or Class Values

If you see the error message **“NS0005 Export Error: Please enter value(s) for 'department', 'location', or 'class' and attempt to export again.”**, it means required classification fields are missing in NetSuite.

This typically affects:

- Vendor bill exports  
- Journal entry exports  
- Expense report exports  

The fix depends on the export type.

---

## Why the NS0005 Export Error Happens

The NS0005 export error occurs when required classification fields such as:

- **Department**
- **Location**
- **Class**

are not populated on the transaction or employee record in NetSuite.

Depending on your export type, these values must either:

- Be removed as required fields on the transaction form, or  
- Be set as default values on the employee record  

---

# How to Fix the NS0005 Export Error for Vendor Bills

If you are exporting **vendor bills**, update the preferred vendor bill form in NetSuite.

## Step 1: Update the Vendor Bill Form in NetSuite

In NetSuite:

1. Go to **Customization > Forms > Transaction Forms**.
2. Click **Edit** next to the vendor bill form marked as preferred.
3. Go to **Screen Fields > Main**.
4. Locate **Department**, **Location**, and **Class**.
5. Uncheck both **Show** and **Mandatory** for each field.
6. Save your changes.

---

## Step 2: Sync the Connection in Expensify

On web:

1. Go to the **navigation tabs on the left** and select **Workspaces**.
2. Select your Workspace.
3. Select **Accounting**.
4. Click the **three-dot icon** next to the NetSuite connection.
5. Click **Sync now**.

On mobile:

1. Tap the **navigation tabs on the bottom** and select **Workspaces**.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the NetSuite connection.
5. Tap **Sync now**.

Retry exporting the report after the sync completes.

---

# How to Fix the NS0005 Export Error for Journal Entries or Expense Reports

If you are exporting **journal entries** or **expense reports**, update the employee record in NetSuite.

## Step 1: Set Default Classification Values on the Employee Record

In NetSuite:

1. Go to **Lists > Employees**.
2. Locate and edit the employee profile associated with the report creator or submitter’s email address.
3. Set default values for:
   - **Department**
   - **Class**
   - **Location**
4. Save the employee record.

---

## Step 2: Sync the Connection in Expensify

On web:

1. Go to **Workspaces** from the navigation tabs on the left.
2. Select your Workspace.
3. Select **Accounting**.
4. Click the **three-dot icon** next to the NetSuite connection.
5. Click **Sync now**.

On mobile:

1. Tap **Workspaces** from the navigation tabs on the bottom.
2. Select your Workspace.
3. Tap **Accounting**.
4. Tap the **three-dot icon** next to the NetSuite connection.
5. Tap **Sync now**.

Retry exporting the report once the sync completes.

---

# FAQ

## Does the NS0005 Export Error affect all export types?

No. The resolution depends on whether you are exporting a vendor bill, journal entry, or expense report.

## Do I need NetSuite admin access to fix the NS0005 Export Error?

Yes. Updating transaction forms or employee records in NetSuite requires appropriate permissions.
