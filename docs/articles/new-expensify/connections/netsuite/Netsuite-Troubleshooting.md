---
title: NetSuite Troubleshooting
description: Troubleshoot common NetSuite sync and export errors.
---

Synchronizing and exporting data between Expensify and NetSuite helps streamline financial processes, but errors can occasionally disrupt the integration. These errors typically arise from missing data, incorrect settings, or configuration issues in NetSuite or Expensify.

This guide provides step-by-step solutions for resolving common NetSuite sync and export errors, ensuring accurate and efficient expense reporting and data management.

---
# ExpensiError NS0005: Please Enter Value(s) for Department, Location, or Class

## Why does this happen?
This error occurs when NetSuite requires classifications (Department, Location, or Class) at the header level, but Expensify only exports them at the line item level.

## Fix for Vendor Bills
1. Go to **Customization > Forms > Transaction Forms**.
2. Click **Edit** on your preferred Vendor Bill form.
3. Navigate to **Screen Fields > Main**.
4. Uncheck **Show** and **Mandatory** for the fields listed in the error message.
5. Sync NetSuite in Expensify: **Settings > Workspaces > Workspace Name > Accounting > Three-dot menu > Sync Now**.
6. Reattempt the export.

## Fix for Journal Entries and Expense Reports
1. Go to **Lists > Employees** in NetSuite.
2. Click **Edit** next to the employee who submitted the report.
3. Scroll to **Classification** and assign a **Department**, **Class**, and **Location**.
4. Click **Save**.
5. Sync NetSuite in Expensify.
6. Reattempt the export.

---
# ExpensiError NS0012: Currency Does Not Exist in NetSuite

## Why does this happen?
This occurs when:
- Expensify sends a currency not listed in your NetSuite subsidiary.
- You are using a non-OneWorld NetSuite instance and exporting a currency other than EUR, GBP, USD, or CAD.

## How to Fix It
1. Ensure the currency in Expensify matches NetSuite.
2. Sync NetSuite in Expensify.
3. Enable **Multiple Currencies** in NetSuite: **Setup > Enable Features**.
4. Add the missing currency via **New Currencies** in the NetSuite global search.
5. Reattempt the export.

---
# ExpensiError NS0021: Invalid Tax Code Reference Key

## Why does this happen?
This error usually results from an issue with Tax Group settings in NetSuite, such as a Tax Code being mapped incorrectly.

## How to Fix It
1. Verify that Tax Codes on Sales Transactions are not mapped to Tax Groups.
2. Ensure the correct Tax Code is assigned to Purchase Transactions.
3. For Australian users:
   - **GST 10%** should be mapped to **NCT-AU** (not TS-AU).
   - **No GST 0%** should be mapped to **NCF-AU** (not TFS-AU).
4. Ensure Tax Groups are enabled under **Set Up Taxes** in NetSuite.
5. Reattempt the export.

---
# ExpensiError NS0023: Employee Does Not Exist in NetSuite

## Why does this happen?
This occurs when the employee’s subsidiary in NetSuite does not match the one selected for the connection in Expensify.

## How to Fix It
1. Verify the employee's subsidiary in NetSuite.
2. Confirm the Expensify workspace’s subsidiary under **Settings > Workspaces > Accounting > Subsidiary**.
3. Check **Lists > Employees > Edit > Access** and uncheck **Restrict Access to Expensify**.
4. Ensure the employee’s email matches in both NetSuite and Expensify.
5. Sync NetSuite in Expensify.
6. Reattempt the export.

---
# ExpensiError NS0085: Expense Lacks Permissions to Set Exchange Rate

## Why does this happen?
This occurs when NetSuite’s exchange rate settings are not configured correctly.

## How to Fix It
1. Go to **Customization > Forms > Transaction Forms**.
2. Select the form being used for export (Expense Report, Journal Entry, or Vendor Bill) and click **Edit**.
3. Ensure the **Exchange Rate** field is set to **Show** under:
   - **Screen Fields > Expenses** (Expense Reports)
   - **Screen Fields > Main** (Vendor Bills)
   - **Screen Fields > Lines** and **Screen Fields > Main** (Journal Entries)
4. Sync NetSuite in Expensify.
5. Reattempt the export.

---

# ExpensiError NS0079: Transaction Date Outside Accounting Period

## Why does this happen?
NetSuite prevents transactions from being posted outside of designated accounting periods.

## How to Fix It
1. In NetSuite, go to **Setup > Accounting > Accounting Preferences**.
2. Under **General Ledger**, set **Allow Transaction Date Outside of Posting Period** to **Warn**.
3. Enable **Export to Next Open Period** in Expensify under **Settings > Workspaces > Accounting > Export**.
4. Sync NetSuite in Expensify.
5. Reattempt the export.

---
# ExpensiError NS0055: Vendor Lacks Access to Currency

## Why does this happen?
This occurs when a vendor in NetSuite is not configured to accept a specific currency.

## How to Fix It
1. In NetSuite, go to **Lists > Relationships > Vendors**.
2. Edit the vendor assigned to the report.
3. Under the **Financial** tab, add the missing currency.
4. Click **Save**.
5. Sync NetSuite in Expensify.
6. Reattempt the export.

---
# ExpensiError NS0068: Missing "Created From" Permission

## Why does this happen?
This occurs due to insufficient permissions on the transaction form being used for export.

## How to Fix It
1. Go to **Customization > Forms > Transaction Forms**.
2. Edit the form marked as **Preferred**.
3. Ensure the **Created From** field is set to **Show** under **Screen Fields > Main**.
4. Sync NetSuite in Expensify.
5. Reattempt the export.

---
# ExpensiError NS0109: NetSuite Login Failed

## Why does this happen?
This error indicates a problem with the authentication tokens used to connect NetSuite and Expensify.

## How to Fix It
1. Review the [NetSuite Connection Guide](https://help.expensify.com/articles/new-expensify/connections/netsuite/Connect-to-NetSuite).
2. If using an existing token, create a new one and update the connection in Expensify.
3. Sync NetSuite in Expensify.
4. Reattempt the export.

---
# ExpensiError NS0037: You Do Not Have Permission to Set a Value for “Receipt URL”  

## Why does this happen?  
This error occurs when the **Receipt URL** field is not visible in NetSuite's transaction form settings.  

## How to Fix It  
1. **Go to NetSuite**: Navigate to **Customization > Forms > Transaction Forms**.  
2. **Find the transaction form**: Locate the form used for the export type (Expense Report, Journal Entry, or Vendor Bill).  
3. **Edit the form**:
   - **Expense Reports**: Go to **Screen Fields > Expenses** and ensure **ReceiptURL** is set to **Show**.  
   - **Journal Entries**: Go to **Screen Fields > Lines** and ensure **ReceiptURL** is set to **Show**.  
   - **Vendor Bills**: Go to **Screen Fields > Main** and ensure **ReceiptURL** is set to **Show**.  
4. **Save the changes** and **sync NetSuite in Expensify** (**Settings > Workspaces > Accounting > Sync Now**).  
5. **Retry the export**.

---

# ExpensiError NS0042: Error Creating Vendor - This Entity Already Exists  

## Why does this happen?  
Expensify is trying to create a new vendor in NetSuite, but a vendor with the same name or email **already exists**.  

## How to Fix It  
1. **Verify vendor details in NetSuite**:
   - Go to **Lists > Relationships > Vendors** and search for the vendor's name and email.  
2. **Ensure email matches**:  
   - The email in NetSuite should match the email of the **report submitter in Expensify**.  
   - If missing, update the NetSuite vendor record with the correct email.  
3. **Check subsidiary association**:  
   - Ensure the vendor belongs to the **same subsidiary** as set in Expensify (**Settings > Workspaces > Accounting > Subsidiary**).  
4. **Enable automatic vendor creation (if needed)**:
   - In Expensify, go to **Settings > Workspaces > Accounting > Advanced** and enable **Auto-create employees/vendors**.  
5. **Sync NetSuite in Expensify** and **retry the export**.

---

# ExpensiError NS0045: Expenses Not Categorized with a NetSuite Account  

## Why does this happen?  
This error occurs when expenses in Expensify are assigned to a **category that does not exist in NetSuite** or **was not imported into Expensify**.  

## How to Fix It  
1. **Check the missing category in NetSuite**:  
   - Search for the category using the **NetSuite Global Search**.  
   - Ensure it is **active** and correctly named.  
   - Confirm it is associated with the correct **subsidiary**.  
2. **Re-sync categories**:  
   - In Expensify, go to **Settings > Workspaces > Accounting > Sync Now**.  
3. **Reapply the category in Expensify**:
   - Open the report, select the affected expense(s), and **reapply the correct category**.  
4. **Retry the export**.

---

# ExpensiError NS0046: Billable Expenses Not Coded with a NetSuite Customer or Billable Project  

## Why does this happen?  
In NetSuite, **billable expenses** must be assigned to a **Customer** or **Billable Project**. If they are missing, this error occurs.  

## How to Fix It  
1. **Check the affected expenses in Expensify**:  
   - Open the report and review **each billable expense**.  
   - Confirm that a **Customer or Project** tag is assigned.  
2. **Update the expense**:
   - Apply the correct **Customer or Project** in Expensify.  
3. **Retry the export**.

---

# ExpensiError NS0061: Please Enter Value(s) for: Tax Code  

## Why does this happen?  
This error occurs when attempting to export **expense reports to a NetSuite Canadian subsidiary** that requires a **Tax Code**, but none is set.  

## How to Fix It  
1. **Enable Tax in NetSuite**:
   - Go to **Setup > Company > Enable Features** and confirm that **Tax Codes** are enabled.  
2. **Ensure the Tax Code exists**:
   - In NetSuite, go to **Setup > Accounting > Tax Codes** and confirm the correct tax codes exist.  
3. **Assign a Tax Posting Account in Expensify**:  
   - Go to **Settings > Workspaces > Accounting > Export** and select a **Journal Entry tax posting account**.  
4. **Sync NetSuite in Expensify** and **retry the export**.

---

# ExpensiError NS0068 (Expensify Card Expenses): Missing "Created From" Permission  

## Why does this happen?  
Expensify Card expenses export as **Journal Entries**. If the **Created From** field is not visible in the Journal Entry form, this error occurs.  

## How to Fix It  
1. **Edit the Journal Entry form in NetSuite**:
   - Go to **Customization > Forms > Transaction Forms**.  
   - Click **Edit** next to the preferred Journal Entry form.  
   - Navigate to **Screen Fields > Main**.  
   - Ensure **Created From** is set to **Show**.  
2. **Save the changes** and **sync NetSuite in Expensify**.  
3. **Retry the export**.

---

# ExpensiError NS0123: Login Error - Expensify Integration Not Enabled  

## Why does this happen?  
This error occurs when **Expensify is not enabled** as an integration in NetSuite.  

## How to Fix It  
1. **Check if Expensify is enabled in NetSuite**:  
   - Go to **Setup > Integrations > Manage Integrations**.  
   - Look for **Expensify Integration** and ensure its **State** is **Enabled**.  
2. **If Expensify is missing**:  
   - Click **Show Inactives** to see if Expensify is listed.  
   - If it appears, **reactivate it**.  
3. **Sync NetSuite in Expensify** and **retry the export**.

---

# Error Creating Employee: Your Role Does Not Have Permission to Access This Record  

## Why does this happen?  
The **NetSuite role** used for the Expensify connection **does not have permission** to create or access employees.  

## How to Fix It  
1. **Verify permissions in NetSuite**:  
   - Follow the [NetSuite Setup Guide](https://help.expensify.com/articles/new-expensify/connections/netsuite/Connect-to-NetSuite) to configure the correct permissions.  
2. **Ensure the report submitter exists in NetSuite**:
   - The email in NetSuite should match the **report submitter’s email in Expensify**.  
   - The employee must belong to the **correct subsidiary**.  
3. **Disable automatic employee creation (if needed)**:
   - In Expensify, go to **Settings > Workspaces > Accounting > Advanced**.  
   - Toggle **Auto-create employees/vendors** **off**.  
4. **Sync NetSuite in Expensify** and **retry the export**.

---

# ExpensiError: Elimination Settings for X Do Not Match  

## Why does this happen?  
This occurs when an **Intercompany Payable account** is set as the default **Payable Account** in NetSuite **subsidiary preferences** while **Accounting Approval** is enabled for Expense Reports.  

## How to Fix It  
1. **Edit the Default Payable Account for Expense Reports**:
   - In NetSuite, go to **Setup > Company > Subsidiaries**.  
   - Click **Edit** next to the affected subsidiary.  
   - Go to the **Preferences** tab.  
   - Select a **valid payable account** for **Default Payable Account for Expense Reports**.  
2. **Repeat this for all subsidiaries** to ensure consistency.  
3. **Sync NetSuite in Expensify** and **retry the export**.

---

# FAQ

## Why Are Reports Exporting as _Accounting Approved_ Instead of _Paid in Full_?

This happens due to:
- **Missing Locations, Classes, or Departments in the Bill Payment Form**
- **Incorrect Expensify Workspace Settings**

## How to fix for Missing Locations, Classes, or Departments

If your accounting classifications require locations, classes, or departments but they are not set to "Show" in your bill payment form, update them in NetSuite:

- Go to **Customization > Forms > Transaction Forms**.
- Find the **preferred Bill Payment form** (checkmarked).
- Click **Edit or Customize**.
- Under **Screen Fields > Main**, enable "Show" for **Department, Class, and Location**.

## How to fix for Incorrect Expensify Workspace Settings:
Check your NetSuite connection settings in Expensify:

- Go to **Settings > Workspaces > [Select Workspace] > Accounting > Advanced**.
- Ensure:
  - **Sync Reimbursed Reports** is enabled with a payment account selected.
  - **Journal Entry Approval Level** is set to **Approved for Posting**.
  - **A/P Approval Account** matches the account used for bill payments.

**To verify the A/P Approval Account:**
- Open the **bill or expense report** causing the issue.
- Click **Make Payment**.
- Ensure the account matches what is set in Expensify.

Lastly, confirm that the **A/P Approval Account** is selected on the **Expense Report List**.

---

## Why Are Reports Exporting as _Pending Approval_?

If reports are marked **"Pending Approval"** instead of **"Approved"**, adjust NetSuite approval settings.

**For Journal Entries/Vendor Bills:**
- Go to **Setup > Accounting > Accounting Preferences** in NetSuite.
- Under the **General** tab, uncheck **Require Approvals on Journal Entries**.
- Under the **Approval Routing** tab, disable approval for **Journal Entries/Vendor Bills**.

**Note:** This applies to all Journal Entries, not just Expensify reports.

**For Expense Reports:**
- Go to **Setup > Company > Enable Features**.
- Under the **Employee** tab, uncheck **Approval Routing** to remove approval for Expense Reports.

**Note:** This also affects purchase orders.

---

## How to Change the Default Payable Account for Reimbursable Expenses in NetSuite

When exporting reimbursable expenses, NetSuite uses a default payable account. To change this:

**For OneWorld Accounts:**
- Go to **Setup > Company > Subsidiaries**.
- Click **Edit** next to the subsidiary.
- Under **Preferences**, update the **Default Payable Account for Expense Reports**.
- Click **Save**.

**For Non-OneWorld Accounts:**
- Go to **Setup > Accounting > Accounting Preferences**.
- Under the **Time & Expenses** tab, update the **Default Payable Account for Expense Reports**.
- Click **Save**.


