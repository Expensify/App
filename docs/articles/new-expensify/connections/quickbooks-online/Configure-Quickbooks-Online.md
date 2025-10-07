---
title: Configure QuickBooks Online
description: Configure your QuickBooks Online connection with Expensify.
keywords: [New Expensify, QuickBooks Online, Expensify integration, accounting settings, import settings, export settings]
---


Connecting QuickBooks Online to Expensify helps streamline expense tracking and financial reporting for admins and employees. This guide walks you through how to configure import, export, and advanced settings for the QuickBooks Online integration.

---

# Step 1: Configure Import Settings

To choose how data is imported from QuickBooks Online to Expensify:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**
2. Click **Import** under the QuickBooks Online connection
3. Review and adjust each of the following:

- **Chart of accounts**: Automatically imported as categories. This setting cannot be changed.
- **Classes**: Import as tags to allow expense-level coding.
- **Customers/Projects**: Import as tags for expense-level coding.
- **Locations**: Import as tags.
  - Note: If you export using the Vendor Bill or Check options, then locations must be configured as report fields, which are only available on the [**Control** plan](https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Billing-Overview#control-plan).
- **Taxes**: Import tax rates and defaults.

## How to Turn Imported Accounts and Tags Off

- Use the toggle on each row to disable individual items
- To disable multiple items at once, select them using checkboxes and click **Disable** at the top

---

# Step 2: Configure Export Settings

To choose how data is exported from Expensify to QuickBooks Online:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**
2. Click **Export** under the QuickBooks Online connection
3. Configure the following settings:

- **Preferred exporter**: Select a workspace admin for automatic exports
  - Note: If card exports are controlled by domain settings, the preferred exporter must be a **Domain Admin**
- **Export date**: Choose from:
  - Date of last expense
  - Submitted date
  - Export date
- **Export out-of-pocket expenses as**:
  - Check
  - Vendor bill
  - Journal entry
    - If **tax is not enabled**, you must select an **Accounts Payable (AP)** account
    - If **tax is enabled**, journal entry exports will not be allowed. You must use check or vendor bill
- **Invoices**: Choose the QuickBooks invoice account to use
- **Export company card expenses as**:
  - Credit card (default)
  - Debit card
  - Vendor bill
    - If exporting as vendor bills, select the AP account and optionally a default vendor

---

# Step 3: Configure Advanced Settings

To manage automation and other connection preferences:

1. From the navigation tabs (on the left on web, and at the bottom on mobile), go to **Workspaces > [Workspace Name] > Accounting > QuickBooks Online**
2. Click **Advanced** under the QuickBooks Online connection
3. Configure the following:

- **Auto-sync**: Automatically updates data between QuickBooks Online and Expensify
- **Invite employees**: Imports and invites employees from QuickBooks Online
- **Automatically create entities**: If a vendor/customer doesn’t exist, Expensify will create one
- **Sync reimbursed reports**:
  - If marked as paid in QuickBooks Online, the report will show as reimbursed in Expensify
  - If reimbursed via ACH in Expensify, the status will sync to paid in QuickBooks
- **Invoice collection account**: Select where paid invoices are stored

---

# FAQ

# How do I know if a report is exported successfully?

A message confirming the export will be posted in the chat for the corresponding report.

# What if I manually export a report that was already exported?

Expensify will alert you before re-exporting. If you choose to proceed, a duplicate report will appear in QuickBooks Online.

# Will enabling Auto Sync affect existing reports?

No. Only newly approved reports will auto-export. Any old reports must be manually exported.

# What happens when reimbursed reports are synced?

- Reports reimbursed via ACH in Expensify will show as **Paid** in QuickBooks Online
- Reports marked **Paid** in QuickBooks Online will update to **Reimbursed** in Expensify during the next sync

# Why can't I export reports as vendor bills or checks?

This is likely due to the **Locations** import setting. Locations can only be used as tags. To unlock vendor bill and check exports:
- Turn off location imports
- Or upgrade to the **Control** plan

