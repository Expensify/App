---
title: Netsuite Troubleshooting
description: Troubleshoot common NetSuite sync and export errors in Expensify and learn how to fix each issue.
keywords: [NetSuite, Expensify Classic, export errors, sync issues, troubleshooting]
---

<div id="expensify-classic" markdown="1">

This guide helps you fix common sync and export issues between Expensify and NetSuite. Each section covers an error code, explains what it means, and walks you through how to resolve it.

---

# ExpensiError NS0005: Please enter value(s) for Department, Location, or Class

## Vendor bills

This error occurs when required classification fields are missing in the vendor bill form.

**How to fix:**
1. Go to **Customization > Forms > Transaction Forms** in NetSuite.
2. Click **Edit** next to the vendor bill form used.
3. Go to **Screen Fields > Main**.
4. Uncheck both **Show** and **Mandatory** for Department, Location, and Class.
5. In Expensify, go to **Settings > Workspaces > [Workspace Name] > Accounting** and click **Sync**.
6. Retry the export.

## Journal entries and expense reports

This version of the error means the employee doesn’t have default classifications set.

**How to fix:**
1. In NetSuite, go to **Lists > Employees**.
2. Edit the employee's profile.
3. Set default values for **Department**, **Class**, and **Location**.
4. Save and sync the connection in Expensify.

---

# ExpensiError NS0012: Currency does not exist in NetSuite

## Scenario 1

The currency being used isn’t available in the NetSuite subsidiary.

**How to fix:**
1. Confirm the report currency in Expensify matches what’s available in NetSuite.
2. Sync your connection and re-export.

## Scenario 2

By default, non-OneWorld NetSuite instances only support **EUR**, **GBP**, **USD**, and **CAD**.

**How to fix:**
1. In NetSuite, go to **Setup > Enable Features**.
2. Enable **Multiple Currencies**.
3. Add the required currency using the global search bar.

---

# ExpensiError NS0021: Invalid Tax Code Reference Key

Usually caused by incorrect tax group mapping in NetSuite.

**How to fix:**
- **GST 10%** should map to **NCT-AU**, not **TS-AU**.
- **No GST 0%** should map to **NCF-AU**, not **TFS-AU**.

---

# ExpensiError NS0023: Employee does not exist in NetSuite (Invalid employee)

The employee’s subsidiary or email doesn’t match between NetSuite and Expensify.

**How to fix:**
1. In NetSuite, confirm the employee's subsidiary matches the Expensify workspace.
2. Make sure the employee’s email matches in both systems.
3. Sync your NetSuite connection.

---

# ExpensiError NS0024: Invalid customer or project tag

This means the employee isn’t listed as a resource on the customer or project.

**How to fix:**
1. In NetSuite, go to **Lists > Relationships > Customer/Projects**.
2. Edit the relevant customer or project and add the employee as a resource.
3. Sync and retry the export.

---

# ExpensiError NS0034: This record already exists

The report has already been exported to NetSuite.

**How to fix:**
1. Search for the **Report ID** in NetSuite.
2. Delete the duplicate and re-export from Expensify.

---

# ExpensiError NS0046: Billable expenses not coded with a NetSuite customer or billable project

**How to fix:**
1. In Expensify, tag all billable expenses with a valid **Customer** or **Project**.
2. Retry the export.

---

# ExpensiError NS0059: No credit card account selected for corporate card expenses

**How to fix:**
1. In NetSuite, go to **Subsidiaries** and set the **Default Account for Corporate Card Expenses**.
2. Sync with Expensify.

---

# ExpensiError NS0085: Expense does not have appropriate permissions for setting an exchange rate

**How to fix:**
1. In NetSuite, ensure the **Exchange Rate** field is visible on the relevant form.
2. Sync and retry.

---

# ExpensiError NS0079: The transaction date is not within the date range of your accounting period

**How to fix:**
1. In NetSuite, go to **Accounting Preferences**.
2. Set **Allow Transaction Date Outside of the Posting Period** to **Warn**.
3. In Expensify, enable **Export to Next Open Period** and sync.

---

# ExpensiError NS0055: Vendor doesn't have access to the currency

**How to fix:**
1. In NetSuite, add the correct currency to the vendor's **Financial tab**.
2. Sync and retry.

---

# ExpensiError NS0068: You do not have permission to set a value for element “Created From”

**How to fix:**
1. In NetSuite, ensure the **Created From** field is visible in the transaction form.
2. Sync with Expensify.

---

# ExpensiError NS0037: You do not have permission to set a value for element “Receipt URL”

**How to fix:**
1. Make sure the **Receipt URL** field is visible in NetSuite.
2. Sync and retry.

---

# ExpensiError NS0042: Error creating vendor – This entity already exists

**How to fix:**
1. In NetSuite, check that the vendor's email and subsidiary match what's in Expensify.
2. Sync your connection and retry.

---

# ExpensiError NS0109: Failed to login to NetSuite – Please verify your credentials

**How to fix:**
1. Review [this guide](https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/NetSuite) to ensure credentials are valid.
2. If needed, generate a new token for the connection.

---

# ExpensiError NS0123: Login error – Please make sure that the Expensify integration is enabled

**How to fix:**
1. In NetSuite, go to **Setup > Integrations > Manage Integrations**.
2. Enable the **Expensify Integration**.

---

# ExpensiError NS0045: Expenses not categorized with a NetSuite account

**How to fix:**
1. In NetSuite, confirm the **expense category** is active and properly named.
2. Sync your connection and try again.

---

# ExpensiError NS0056: You do not have permissions to set a value for element...

Common elements include:
- `class`
- `location`
- `memo`
- `amount`
- `isnonreimbursable`
- `department`
- `exchangerate`
- `entityID`
- `supervisor approval`

**How to fix:**
1. Go to **Customization > Forms > Transaction Forms**.
2. Search for the correct form type (Expense Report, Journal Entry, Vendor Bill).
3. Edit the form with the **Preferred** checkbox selected.
4. Go to:
   - **Screen Fields > Lines** for Journal Entries
   - **Screen Fields > Main** for Vendor Bills
5. Make sure the listed field is marked as **Show**.

## Additional fixes by element

**Element:** `line.entity`

1. Edit your **Journal Entry** form.
2. Under **Screen Fields > Main**, ensure the **Name** field is shown.

**Element:** `entityid`

1. Go to **Customization > Forms > Entry Forms** and edit the preferred **Vendor** form.
2. Set **Vendor ID** to:
   - Show
   - Quick Add
   - Mandatory
3. Search **Auto-Generated Numbers** in NetSuite and:
   - Disable them, or
   - Enable **Allow Override**.

**Element:** `approvalstatus`

1. Edit your form and make sure **Approval Status** is shown.
2. Optional: Disable approval routing under **Setup > Accounting > Accounting Preferences > Approval Routing**.
3. Add missing permissions under **Setup > Users/Roles > Manage Roles > Expensify Integration > Edit**.
4. Under **Permissions > Transactions**, add **Approve Vendor Payments** with **Full** access.
5. Review **Customization > Workflows** and category-specific settings if issues persist.

**Element:** `expense.foreignamount`

1. In NetSuite, open each **Expense Category** and disable **Rate is Required**.
2. Sync and retry.

**Element:** `tranid`

1. In NetSuite, search **Auto-Generated Numbers**.
2. Enable **Allow Override** for Invoices.

**Element:** `memo`

It can appear if the report has a negative reimbursable total. Only positive reimbursable reports can be exported.

**Element:** `nexus`

1. Go to **Setup > Users/Roles > Manage Roles > Expensify Integration > Edit**.
2. Under **Permissions > Lists**, set **Tax Details Tab** to **Full**.

---

# FAQ

## Why am I seeing “You do not have permissions to set a value for element…” errors?

This usually means a required field is hidden or restricted in NetSuite. Edit the preferred form and check that the field is visible.

## What if I’ve made all changes and still see the error?

- Check your Expensify bundle version in NetSuite.
- Review **Customization > Workflows** for blockers.
- Ask your NetSuite admin to confirm no custom scripts are interfering.

## Why are reports exporting as "Accounting Approved" instead of "Paid in Full"?

This may be due to missing **Location**, **Class**, or **Department** info, or misconfigured Expensify workspace settings.

**How to fix:**
1. Update your **Bill Payment Form** in NetSuite.
2. Verify **Expensify workspace connection settings** under **Accounting > Accounting Integrations > Advanced**.

## "Invite Employees & Set Approval Workflow" is enabled, why are NetSuite approvers not being set as Expensify approvers?

The Invite Employees & Set Approval Workflow setting will not overwrite manual changes to the approval table, so if an employee was added before this setting was enabled, the integration will not automatically update their approver to their NetSuite approver/supervisor.

**Fix**:
1. Remove the employee from the workspace from **Settings > Workspaces > Group > [Workspace Name] > Members**.
2. Sync the connection from **Settings > Workspaces > Group > [Workspace Name] > Accounting > Sync Now** to import the employee and their designated NetSuite approver.

**Alternative fix:**
Manually update the employee's approver in **Settings > Workspaces > Group > [Workspace Name] > Members**.

</div>
