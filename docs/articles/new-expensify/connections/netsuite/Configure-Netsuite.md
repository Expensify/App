---
title: Configure NetSuite
description: Learn how to configure the Import, Export, and Advanced settings for Expensify's integration with NetSuite.
order: 2
---

Expensify’s integration with NetSuite streamlines expense management by automatically syncing expense reports. This reduces manual entry, minimizes errors, and provides real-time visibility into spending. With this integration, you can:

- Speed up approvals and reimbursements.
- Gain clear insights for budgeting and compliance.
- Ensure seamless data flow between Expensify and NetSuite.

# Accessing NetSuite Configuration Settings

NetSuite is connected at the workspace level, and each workspace can have a unique configuration. 

To access the configuration settings:

1. Click **Settings** in the bottom left menu.
2. Select **Workspaces** from the left menu.
3. Choose the workspace you want to configure.
4. Click **Accounting** in the left menu.

---

## Step 1: Configure Import Settings

To determine how data is imported from NetSuite to Expensify:

1. Go to **Accounting** > **Import**.
2. Review and configure the following settings:

   - **Categories**: NetSuite Expense Categories are automatically imported.
   - **Departments, Classes, and Locations**: Import options include Tags, Report Fields, or Employee Defaults.
   - **Customers and Projects**: Choose to import them as Tags or Report Fields.
     - *Cross-Subsidiary Customers/Projects*: Enable this to import data across all NetSuite subsidiaries. Ensure "Intercompany Time and Expense" is enabled in NetSuite under **Setup > Company > Enable Features > Advanced Features**.
   - **Tax**: Import NetSuite Tax Groups and configure in the Taxes tab.
   - **Custom Segments and Records**: Import segments and records as Tags or Report Fields.
     - Use the correct Field ID from NetSuite’s Transactions tab.
     - Avoid using the “Filtered by” feature in Custom Segments.
   - **Custom Lists**: Enable to import lists as Tags or Report Fields.

3. Click the **three-dot icon** > **Sync Now** to update settings.
4. After configuring settings, sync the NetSuite connection to apply changes.

---

## Step 2: Configure Export Settings

To determine how data is exported from Expensify to NetSuite:

1. Go to **Accounting** > **Export**.
2. Review and configure the following settings:

   - **Preferred Exporter**: Select an admin to handle exports.
   - **Export Date Options**:
     - *Date of Last Expense*
     - *Submitted Date*
     - *Exported Date*
   - **Export Out-of-Pocket Expenses As**:
     - *Expense Reports*
     - *Vendor Bills*
     - *Journal Entries* (Note: Customers/projects cannot be exported with this option.)
   - **Export Company Card Expenses As**:
     - *Expense Reports*, *Vendor Bills*, or *Journal Entries*.
     - Expensify Card expenses always export as Journal Entries.
   - **Export Invoices To**: Choose an Accounts Receivable account.
   - **Invoice Item**: Select or create an invoice line item.
   - **Export Foreign Currency Amount**: Enable to export original expense amounts.
   - **Export to Next Open Period**: Automatically exports expenses to the next open NetSuite period if the current one is closed.

3. Click the **three-dot icon** > **Sync Now** to update settings.

---

## Step 3: Configure Advanced Settings

To manage additional integration features:

1. Go to **Accounting** > **Advanced**.
2. Review and configure the following settings:

   - **Auto-Sync**: Enable for daily syncing.
   - **Sync Reimbursed Reports**: Automatically updates reimbursement status between Expensify and NetSuite.
   - **Invite Employees & Set Approvals**: Imports employees and sets approval workflows.
   - **Auto Create Employees/Vendors**: Creates a NetSuite employee/vendor record if one doesn’t exist.
   - **Enable Newly Imported Categories**: Automatically enables new Expense Categories from NetSuite.
   - **Approval Levels**: Set NetSuite approval levels for Expense Reports, Vendor Bills, and Journal Entries.
   - **Custom Form ID**: Use a specific NetSuite transaction form instead of the default.

3. Click the **three-dot icon** > **Sync Now** to apply changes.

---

# FAQ

## How do I import new tags (departments, classes, locations) from NetSuite?

1. Add new tags in NetSuite.
2. Sync the NetSuite connection in Expensify.
3. Enable or disable tags under **Settings > Workspaces > [Workspace Name] > Tags**.

## Can I automate employee invitations and approval workflows from NetSuite?

Yes, enabling the feature will:
- Import employees from the connected NetSuite subsidiary.
- Notify them via email.
- Allow workflow configuration in Expensify Classic (**Settings > Workspaces > People**).

## Why do company card expenses export immediately, but reimbursable expenses don’t?

- **Reimbursable expenses** export upon reimbursement in Expensify.
- **Company card expenses** export upon approval.
- If Auto-Sync is enabled, reimbursement status updates automatically.

## How do I configure corporate card exports in NetSuite?

1. Select the correct corporate card under **Customization > Forms > Transaction Forms**.
2. Enable "Show" for "Account for Corporate Card Expenses" and "Corporate Card" fields.
3. Set the default card account on employee records.

## Why can’t I import custom segments created before 2019.1?

Check the "Use as Field ID" box in NetSuite. This assigns a unified ID to older segments.

## How does Auto-Sync work with reimbursed reports?

- If a report is reimbursed in Expensify, NetSuite marks it as paid.
- If a report is marked as paid in NetSuite, Expensify updates the status during the next sync.

## Will enabling Auto-Sync affect existing reports?

No, only newly approved reports will auto-export. Manually export older reports if needed.

## How does multi-currency exporting work in NetSuite?

- Employee/vendor currency must match the subsidiary currency.
- The bank account currency must match the subsidiary currency for bill payments.
