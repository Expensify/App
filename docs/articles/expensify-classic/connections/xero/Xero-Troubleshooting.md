---
title: Xero Troubleshooting
description: Troubleshooting common Xero integration errors in Expensify, including sync and export issues.
keywords: [Expensify Classic, Xero troubleshooting]
---

<div id="expensify-classic" markdown="1">
   
Synchronizing and exporting data between Expensify and Xero can streamline your financial processes, but occasionally, errors may occur due to discrepancies in settings, missing data, or configuration issues.

This guide provides step-by-step solutions to common Xero-related errors to ensure a seamless connection and accurate expense reporting.

---

# ExpensiError XRO014: Billable Expenses Require a Customer

## Why does this happen?
Xero requires all billable expenses exported from Expensify to have a customer assigned. This error occurs when one or more expenses are marked "billable" but lack an associated customer.

## How to fix it
1. Navigate to **Settings > Workspaces > [workspace] > Accounting > Configure > Coding tab**.
2. Enable **Billable Expenses** by toggling the setting.
3. Click **Save** to sync the connection.
4. Open the report and apply a **Customer** tag to each billable expense.
   - *Note: A Xero Contact becomes a Customer only after an invoice has been raised against them. If the Customer is missing, create a dummy invoice in Xero, then delete/void it and sync again.*
5. Retry the export by clicking **Export to > Xero**.

---

# ExpensiError XRO027: Category No Longer Exists in Xero

## Why does this happen?
Xero does not accept expenses categorized under accounts that no longer exist in the Chart of Accounts.

## How to fix it
1. Log into Xero and navigate to **Settings > Chart of Accounts**.
2. Ensure all expense categories in Expensify are active in Xero.
3. If a category is missing, add it back in Xero and sync Expensify.
4. If the category exists, ensure **Show in Expense Claims** is enabled.
5. Sync Expensify, open the report, and recategorize expenses flagged with a red violation.
6. Click **Export to > Xero**.

---

# ExpensiError XRO031: Payment Already Allocated to Reimbursable Expenses

## Why does this happen?
Xero does not allow modifications to paid expenses. If a reimbursable expense is re-exported, Xero rejects it as a modification.

## How to fix it
1. In Xero, go to **Business > Bills to Pay > Paid tab**.
2. Locate and open the report with the error.
3. Click on the blue **Payment** link.
4. Click **Options > Remove and Redo** (*Do not void the bill*).
5. In Expensify, open the report and click **Export to > Xero**.
   - The new export will override the previous report while retaining the same ID.

---

# ExpensiError XRO087: No or Incorrect Bank Account

## Why does this happen?
Xero requires bank transactions from Expensify to be posted to an active bank account. This error occurs when the destination account is missing or incorrect.

## How to fix it
1. In Expensify, go to **Settings > Workspaces > [workspace] > Accounting > Configure**.
2. Select a **Xero Bank Account** for non-reimbursable expenses.
3. Click **Save** to sync the connection.
4. Open the report and retry the export.

---

# ExpensiError XRO052: Expenses Not Categorized with a Xero Account

## Why does this happen?
Xero requires all expenses to be categorized under valid accounts in the Chart of Accounts.

## How to fix it
1. Sync Expensify with Xero under **Settings > Workspaces > [Workspace Name] > Accounting > Sync Now**.
2. Review expenses for red category violations and recategorize them.
3. Click **Export to > Xero**.
4. If errors persist:
   - Verify category settings under **Settings > Workspaces > Categories**.
   - Ensure categories match exactly with Xero’s Chart of Accounts.
5. Sync again and retry the export.

---

# ExpensiError XRO068: Currency Not Subscribed in Xero

## Why does this happen?
Xero requires all currencies used in Expensify to be added before exporting expenses in that currency.

## How to fix it
1. In Xero, go to **Settings > General Settings > Features > Currencies**.
2. Click **Add Currency** and select the required currency.
3. Sync Expensify with Xero (**Settings > Workspaces > Accounting**).
4. Open the report and click **Export to > Xero**.
   - *Note: Adding currencies requires the Established Xero plan. [Upgrade if necessary](https://www.xero.com/us/pricing-plans/).* 

---

# ExpensiError XRO076: Report Previously Exported and Voided

## Why does this happen?
Xero does not allow modifications to voided purchase bills.

## How to fix it
1. In Expensify, locate the report on the **Reports** page.
2. Select the report and click **Copy**.
3. Submit the copied report for approval and export it to Xero.

---

# ExpensiError XRO099: Xero Invoice Approval Limit Reached

## Why does this happen?
The Early plan in Xero allows only 5 bills per month. This error occurs when the limit is reached.

## How to fix it
Upgrade your Xero account to a **Growing or Established plan**. [See Xero pricing](https://www.xero.com/us/pricing-plans/).

---

# Why Are Company Card Expenses Exported to the Wrong Account?

1. Confirm that **company cards** are mapped correctly:
   - **Settings > Domains > Company Cards > Edit Export**.
2. Verify that expenses have the **Card+Lock icon** (indicating they were imported from a company card).
3. Ensure the exporter is a **Domain Admin**:
   - Check the **Preferred Exporter** setting under **Settings > Workspaces > Accounting > Configure**.
4. Verify company card mapping under the correct workspace.

---

# Why Do Non-Reimbursable Expenses Show 'Credit Card Misc' Instead of the Merchant?

If a merchant in Expensify **matches** a contact in Xero, expenses will reflect the vendor name. Otherwise, they default to \"Expensify Credit Card Misc\" to prevent duplicates.

## How to fix it
Use **Expense Rules** in Expensify to standardize merchant names. Learn more [here](https://help.expensify.com/articles/expensify-classic/expenses/Create-Expense-Rules).

---

</div>

