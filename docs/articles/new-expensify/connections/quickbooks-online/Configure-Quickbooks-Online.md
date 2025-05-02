---
title: Configure QuickBooks Online
description: Configure your QuickBooks Online connection with Expensify.
keywords: [QuickBooks Online, Expensify integration, accounting settings, import settings, export settings]
---

Connecting QuickBooks Online to Expensify optimizes expense tracking and reporting for employees and admins alike. This guide walks you through configuring your import, export, and advanced settings for optimal performance.

---

# Step 1: Configure Import Settings

The following steps help you determine how data will be imported from QuickBooks Online to Expensify.

1. Under the **Accounting settings** for your workspace, click **Import** under the QuickBooks Online connection.
2. Review each of the following import settings:
   - **Chart of Accounts**: Imported automatically as categories. This cannot be amended.
   - **Classes**: Import classes as tags for expense-level coding.
   - **Customers/Projects**: Import customers/projects as tags for expense-level coding.
   - **Locations**: Import locations as tags for expense-level coding
       - **Note:** Locations are only configurable as tags, so you cannot export expense reports as vendor bills or checks. To unlock these options, disable locations import or upgrade to the Control Plan.
   - **Taxes**: Import tax rates and defaults.
3. **Disable Imported Accounts and Tags** (if needed):
   - Toggle individual items on/off using the switch on the right side of each row.
   - To disable multiple items at once, select multiple checkboxes and click **Disable** at the top of the page.

# Step 2: Configure Export Settings

The following steps help you determine how data will be exported from Expensify to QuickBooks Online.

1. Under the **Accounting settings** for your workspace, click **Export** under the QuickBooks Online connection.
2. Review each of the following export settings:
   - **Preferred Exporter**: Assign a **Workspace Admin** to automate report exports.
     - **Note:** Other Workspace Admins can still export to QuickBooks Online. If you set different export accounts for company cards under domain settings, the Preferred Exporter must be a **Domain Admin**.
   - **Date**: Please use the date of the last expense, export date, or submitted date.
   - **Export Out-of-Pocket Expenses as**: Select check, journal entry, or vendor bill.
      - If tax is **not** enabled, select an **Accounts Payable/AP**.
      - If tax **is** enabled, exporting as journal entries is not available. If enabled later, an error message will appear until the export setting is changed to **vendor bill** or **check**.
   - **Invoices**: Select the QuickBooks Online invoice account where invoices will be exported.
   - **Export Company Cards**: Export as **credit card** (default), **debit card**, or **vendor bill**. If selecting **vendor bill**:
     - Choose the **accounts payable account** that vendor bills will be created from.
     - Optionally, set a **default vendor** for credit card transactions.

# Step 3: Configure Advanced Settings

These steps help you determine additional connection settings like auto-sync and employee invitation settings.

1. Under the **Accounting settings** for your workspace, click **Advanced** under the QuickBooks Online connection.
2. Select an option for each of the following settings:
   - **Auto-Sync**: Enable automatic updates between QuickBooks Online and Expensify.
   - **Invite Employees**: Allow Expensify to import and invite employees from QuickBooks Online.
   - **Automatically Create Entities**: Enable Expensify to create vendors/customers in QuickBooks Online if a match does not exist.
   - **Sync Reimbursed Reports**: If enabled, reports marked as **Paid** in QuickBooks Online will also be marked as **Paid** in Expensify.
   - **Invoice Collection Account**: Select the invoice collection account where invoices will be stored once marked as paid.

---

# FAQ

## How do I know if a report is successfully exported to QuickBooks Online?

When a report exports successfully, a message is posted in the expense’s related chat room:

![Confirmation message posted in the expense chat room](https://help.expensify.com/assets/images/QBO_help_01.png){:width="100%"}

## What happens if I manually export a report that has already been exported?

Expensify will notify you if the report has already been exported. Re-exporting will create a duplicate report in QuickBooks Online.

## What happens to existing approved and reimbursed reports if I enable Auto Sync?

- If **Auto Sync was disabled** when linking QuickBooks Online, enabling it won’t impact existing reports that haven’t been exported.
- If a report has been exported and **reimbursed via ACH**, it will be marked as **Paid** in QuickBooks Online during the next sync.
- If a report has been exported and **marked as Paid** in QuickBooks Online, it will be marked as **Reimbursed** in Expensify during the next sync.
- Reports that have not yet been exported **will not** be automatically exported when enabling Auto Sync.
